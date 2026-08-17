import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { extractInsertId, resolveDatabaseUrl } from "./db";

describe("resolveDatabaseUrl", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  beforeEach(() => {
    delete process.env.DATABASE_URL;
  });

  afterEach(() => {
    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }
  });

  it("falls back to the shared environment database URL", () => {
    expect(resolveDatabaseUrl()).toContain("mysql://");
  });
});

describe("extractInsertId", () => {
  it("reads insertId from a direct MySQL result object", () => {
    expect(extractInsertId({ insertId: 42 })).toBe(42);
  });

  it("reads insertId from an array-wrapped result", () => {
    expect(extractInsertId([{ insertId: 42 }])).toBe(42);
  });

  it("returns undefined when no insertId exists", () => {
    expect(extractInsertId({ affectedRows: 1 })).toBeUndefined();
  });
});
