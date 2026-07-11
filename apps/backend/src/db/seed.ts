import { faker } from "@faker-js/faker";
import { db } from "./client.js";
import {
  merchants,
  checkoutSessions,
  recoveryJobs,
  conversionEvents,
  splitConfigs,
} from "./schema.js";

type Merchant = typeof merchants.$inferSelect;
type Session = typeof checkoutSessions.$inferSelect;

async function seed() {
  console.log("🌱 Clearing database...");
  await db.transaction(async (tx) => {
    console.log("Clearing tables...");

    // Clear children first
    await tx.delete(recoveryJobs);
    await tx.delete(conversionEvents);
    await tx.delete(splitConfigs);
    await tx.delete(checkoutSessions);
    await tx.delete(merchants);

    console.log("✅ Database cleared.");

    console.log("Creating merchants...");

    const merchantData = await tx
      .insert(merchants)
      .values([
        {
          nombaClientId: "merchant-client-001",
          nombaSecret: "secret-001",
          email: "techstore@example.com",
        },
        {
          nombaClientId: "merchant-client-002",
          nombaSecret: "secret-002",
          email: "fashionhub@example.com",
        },
        {
          nombaClientId: "merchant-client-003",
          nombaSecret: "secret-003",
          email: "coffeeexpress@example.com",
        },
      ])
      .returning();

    console.log("Creating split configs...");

    await tx.insert(splitConfigs).values([
      {
        merchantId: merchantData[0].id,
        subAccountId: "SUB-001",
        percentage: 85,
      },
      {
        merchantId: merchantData[1].id,
        subAccountId: "SUB-002",
        percentage: 90,
      },
      {
        merchantId: merchantData[2].id,
        subAccountId: "SUB-003",
        percentage: 80,
      },
    ]);

    console.log("Creating checkout sessions...");

    const sessions: Session[] = [];

    for (let i = 0; i < 100; i++) {
      const merchant =
        merchantData[Math.floor(Math.random() * merchantData.length)];

      const status = faker.helpers.weightedArrayElement([
        { value: "completed", weight: 72 },
        { value: "pending", weight: 18 },
        { value: "recovered", weight: 10 },
      ]) as "completed" | "pending" | "recovered";

      const created = faker.date.recent({ days: 30 });

      const completedAt =
        status === "completed" || status === "recovered"
          ? faker.date.between({
              from: created,
              to: new Date(),
            })
          : null;

      const session = (
        await tx
          .insert(checkoutSessions)
          .values({
            merchantId: merchant.id,
            nombaOrderId: `ORD-${1000 + i}`,
            customerEmail: faker.internet.email(),
            amount: faker.helpers.arrayElement([
              5000, 7500, 10000, 12500, 15000, 20000, 25000, 35000, 50000,
              65000,
            ]),
            currency: "NGN",
            status,
            createdAt: created,
            completedAt,
          })
          .returning()
      )[0];

      sessions.push(session);
    }

    console.log("Creating recovery jobs...");

    const pendingSessions = sessions.filter((s) => s.status === "pending");

    faker.helpers.shuffle(pendingSessions);

    const recoveryTargets = pendingSessions.slice(
      0,
      Math.min(20, pendingSessions.length),
    );

    await tx.insert(recoveryJobs).values(
      recoveryTargets.map((session) => ({
        sessionId: session.id,
        scheduledAt: faker.date.soon({
          days: 3,
          refDate: session.createdAt,
        }),
        sentAt:
          Math.random() < 0.8
            ? faker.date.soon({
                days: 5,
                refDate: session.createdAt,
              })
            : null,
        status: faker.helpers.weightedArrayElement([
          { value: "sent", weight: 70 },
          { value: "pending", weight: 20 },
          { value: "failed", weight: 10 },
        ]) as "sent" | "pending" | "failed",
      })),
    );

    console.log("Creating conversion events...");

    const events = [];

    for (const session of sessions) {
      const merchant = merchantData.find(
        (m: { id: string }) => m.id === session.merchantId,
      )!;

      const paymentMethod = faker.helpers.weightedArrayElement([
        { value: "card", weight: 55 },
        { value: "bank_transfer", weight: 25 },
        { value: "ussd", weight: 15 },
        { value: "qr", weight: 5 },
      ]);

      // Every checkout begins with a created event
      events.push({
        merchantId: merchant.id,
        sessionId: session.id,
        paymentMethod,
        eventType: "created" as const,
        createdAt: session.createdAt,
      });

      if (session.status === "completed") {
        events.push({
          merchantId: merchant.id,
          sessionId: session.id,
          paymentMethod,
          eventType: "completed" as const,
          createdAt:
            session.completedAt ??
            faker.date.soon({ refDate: session.createdAt }),
        });
      }

      if (session.status === "recovered") {
        events.push({
          merchantId: merchant.id,
          sessionId: session.id,
          paymentMethod,
          eventType: "recovered" as const,
          createdAt:
            session.completedAt ??
            faker.date.soon({ refDate: session.createdAt }),
        });
      }
    }

    // Add extra created events until we reach about 190 total events
    while (events.length < 190) {
      const session = faker.helpers.arrayElement(sessions);

      events.push({
        merchantId: session.merchantId,
        sessionId: session.id,
        paymentMethod: faker.helpers.arrayElement([
          "card",
          "bank_transfer",
          "ussd",
          "qr",
        ]),
        eventType: "created" as const,
        createdAt: faker.date.between({
          from: session.createdAt,
          to: new Date(),
        }),
      });
    }

    await tx.insert(conversionEvents).values(events);
  });

  console.log("=================================");
  console.log("🌱 Seed completed successfully!");
  console.log("=================================");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
