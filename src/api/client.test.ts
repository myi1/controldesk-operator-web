import { describe, it, expect } from "vitest";
import { z } from "zod";
import { ApiError, ApiSchemaError } from "./client";

/* ------------------------------------------------------------------ */
/*  ApiError                                                            */
/* ------------------------------------------------------------------ */

describe("ApiError", () => {
  it("stores the http status", () => {
    const err = new ApiError("Not found", 404);
    expect(err.httpStatus).toBe(404);
    expect(err.message).toBe("Not found");
    expect(err.name).toBe("ApiError");
  });

  it("is an instance of Error", () => {
    expect(new ApiError("x", 500)).toBeInstanceOf(Error);
  });
});

/* ------------------------------------------------------------------ */
/*  ApiSchemaError                                                      */
/* ------------------------------------------------------------------ */

describe("ApiSchemaError", () => {
  it("has the correct name", () => {
    const err = new ApiSchemaError("some.method", null);
    expect(err.name).toBe("ApiSchemaError");
  });

  it("includes the method name in the message", () => {
    const err = new ApiSchemaError("my.method", null);
    expect(err.message).toContain("my.method");
  });

  it("embeds Zod field paths in the message when cause is a ZodError", () => {
    const schema = z.object({ name: z.string(), age: z.number() });
    const result = schema.safeParse({ name: 123, age: "not-a-number" });
    expect(result.success).toBe(false);

    const err = new ApiSchemaError("test.method", result.error);
    // Should mention the field paths that failed
    expect(err.message).toContain("name");
    expect(err.message).toContain("age");
  });

  it("does not crash when cause is not a ZodError", () => {
    expect(() => new ApiSchemaError("m", new Error("generic"))).not.toThrow();
    expect(() => new ApiSchemaError("m", null)).not.toThrow();
    expect(() => new ApiSchemaError("m", "string cause")).not.toThrow();
  });

  it("is an instance of Error", () => {
    expect(new ApiSchemaError("m", null)).toBeInstanceOf(Error);
  });
});
