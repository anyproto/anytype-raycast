import { describe, expect, it } from "vitest";
import { encodeQueryParams } from "./query";

describe("encodeQueryParams", () => {
  it("should return empty string for empty params", () => {
    expect(encodeQueryParams({})).toBe("");
  });

  it("should encode single string parameter", () => {
    expect(encodeQueryParams({ name: "John" })).toBe("?name=John");
  });

  it("should encode single number parameter", () => {
    expect(encodeQueryParams({ page: 1 })).toBe("?page=1");
    expect(encodeQueryParams({ limit: 100 })).toBe("?limit=100");
  });

  it("should encode multiple parameters", () => {
    const params = { name: "John", age: 30, city: "New York" };
    expect(encodeQueryParams(params)).toBe("?name=John&age=30&city=New%20York");
  });

  it("should encode special characters", () => {
    const params = {
      email: "test@example.com",
      query: "hello world",
      special: "!@#$%^&*()",
      url: "https://example.com/path?param=value",
    };
    expect(encodeQueryParams(params)).toBe(
      "?email=test%40example.com&query=hello%20world&special=!%40%23%24%25%5E%26*()&url=https%3A%2F%2Fexample.com%2Fpath%3Fparam%3Dvalue",
    );
  });

  it("should handle array values as multiple parameters", () => {
    const params = { tags: ["javascript", "typescript", "react"] };
    expect(encodeQueryParams(params)).toBe("?tags=javascript&tags=typescript&tags=react");
  });

  it("should handle mixed single and array values", () => {
    const params = {
      name: "Project",
      tags: ["work", "important"],
      status: "active",
    };
    expect(encodeQueryParams(params)).toBe("?name=Project&tags=work&tags=important&status=active");
  });

  it("should encode array values with special characters", () => {
    const params = { categories: ["Food & Drink", "Health/Fitness", "Work @ Home"] };
    expect(encodeQueryParams(params)).toBe(
      "?categories=Food%20%26%20Drink&categories=Health%2FFitness&categories=Work%20%40%20Home",
    );
  });

  it("should ignore undefined values", () => {
    const params = {
      name: "John",
      age: undefined,
      city: "Paris",
    } as unknown as Record<string, string | number | string[]>;
    expect(encodeQueryParams(params)).toBe("?name=John&city=Paris");
  });

  it("should handle empty array values", () => {
    const params = { tags: [] as string[] };
    expect(encodeQueryParams(params)).toBe("");
  });

  it("should handle numeric string values", () => {
    const params = { id: "12345", count: "100" };
    expect(encodeQueryParams(params)).toBe("?id=12345&count=100");
  });

  it("should preserve parameter order", () => {
    const params = { a: "1", b: "2", c: "3" };
    expect(encodeQueryParams(params)).toBe("?a=1&b=2&c=3");
  });

  it("should handle empty string values", () => {
    const params = { empty: "", name: "test" };
    expect(encodeQueryParams(params)).toBe("?empty=&name=test");
  });

  it("should handle unicode characters", () => {
    const params = { name: "测试", emoji: "😀🎉" };
    expect(encodeQueryParams(params)).toBe("?name=%E6%B5%8B%E8%AF%95&emoji=%F0%9F%98%80%F0%9F%8E%89");
  });
});
