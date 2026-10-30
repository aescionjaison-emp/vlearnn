import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createApp } from "../app";
import { firestoreService } from "../services/firestoreService";
import { getDb } from "../config/firebase";

const app = createApp();
let server: http.Server;
let port: number;
let baseUrl: string;

test.before(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address();
      if (addr && typeof addr === "object") {
        port = addr.port;
        baseUrl = `http://127.0.0.1:${port}`;
      }
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

test("Concurrent Enquiry Creation: 10 simultaneous submissions produce strictly unique, sequential numbers with zero collisions", async () => {
  const CONCURRENCY_COUNT = 10;
  const createdEnquiries: any[] = [];

  // Generate 10 concurrent requests simultaneously
  const submissionPromises = Array.from({ length: CONCURRENCY_COUNT }).map(
    (_, index) =>
      fetch(`${baseUrl}/api/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: `Concurrent Candidate ${index + 1}`,
          email: `concurrent.candidate.${index + 1}.${Date.now()}@vlearnn.com`,
          phone: "+91 9876543210",
          message: `Simultaneous submission load test candidate ${index + 1}.`,
          preferredMode: "HYBRID",
          consentGiven: true,
        }),
      }).then(async (res) => {
        assert.equal(res.status, 201, "Each concurrent submission must return 201 Created");
        const json = (await res.json()) as any;
        assert.equal(json.success, true);
        return json.data;
      })
  );

  const results = await Promise.all(submissionPromises);

  // 1. Verify all received an enquiryNumber
  assert.equal(results.length, CONCURRENCY_COUNT);
  const enquiryNumbers = results.map((r) => r.enquiryNumber);

  // 2. Verify all enquiryNumbers are completely unique
  const uniqueNumbers = new Set(enquiryNumbers);
  assert.equal(
    uniqueNumbers.size,
    CONCURRENCY_COUNT,
    `All ${CONCURRENCY_COUNT} enquiry numbers must be completely unique. Found duplicates: ${JSON.stringify(enquiryNumbers)}`
  );

  // 3. Verify format and sequential property
  const currentYear = new Date().getFullYear();
  const sequenceNumbers = enquiryNumbers.map((num) => {
    const match = num.match(new RegExp(`^VL-ENQ-${currentYear}-(\\d+)$`));
    assert.ok(match, `Enquiry number "${num}" must match format VL-ENQ-${currentYear}-<number>`);
    return parseInt(match[1], 10);
  });

  // Sort numbers to verify consecutive sequence
  sequenceNumbers.sort((a, b) => a - b);
  for (let i = 0; i < sequenceNumbers.length - 1; i++) {
    const diff = sequenceNumbers[i + 1] - sequenceNumbers[i];
    assert.equal(
      diff,
      1,
      `Sequence numbers must be strictly consecutive without gaps. Found gap between ${sequenceNumbers[i]} and ${sequenceNumbers[i + 1]}`
    );
  }

  // Clean up created test enquiries from Firestore
  for (const num of enquiryNumbers) {
    const enq = await firestoreService.getEnquiryByNumber(num);
    if (enq) {
      await firestoreService.deleteEnquiry(enq.id);
    }
  }
});

test("Enquiry Counter Uniqueness: pre-existing lock document forces counter to skip and prevent duplicate", async () => {
  const currentYear = new Date().getFullYear();
  const db = getDb();

  // Find next potential number by reading current counter
  const counterRef = db.collection("counters").doc(`enquiries_${currentYear}`);
  const counterDoc = await counterRef.get();
  const nextTarget = (counterDoc.data()?.lastNumber || (currentYear === 2026 ? 10000 : 1000)) + 1;
  const lockedNumber = `VL-ENQ-${currentYear}-${nextTarget}`;

  // Pre-seed a lock document to simulate a collision condition
  const lockRef = db.collection("enquiry_numbers").doc(lockedNumber);
  await lockRef.set({
    enquiryId: "simulated-existing-lock",
    enquiryNumber: lockedNumber,
    createdAt: new Date().toISOString(),
  });

  try {
    // Create new enquiry
    const enq = await firestoreService.createEnquiry({
      fullName: "Collision Avoidance Tester",
      email: "avoidance.tester@vlearnn.com",
      phone: "+91 9988776655",
      message: "Testing that counter safely bypasses existing lock documents without collision.",
    });

    // The assigned enquiry number must NOT equal the locked number
    assert.notEqual(
      enq.enquiryNumber,
      lockedNumber,
      "Enquiry creator must safely advance past pre-existing lock document"
    );
    assert.equal(
      enq.enquiryNumber,
      `VL-ENQ-${currentYear}-${nextTarget + 1}`,
      "Must advance to the next subsequent integer"
    );

    // Clean up
    await firestoreService.deleteEnquiry(enq.id);
  } finally {
    await lockRef.delete().catch(() => {});
  }
});

