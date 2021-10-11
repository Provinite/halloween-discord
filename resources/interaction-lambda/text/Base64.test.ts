import { encode } from "./Base64";

describe("utils:Base64", () => {
  describe("function:encode", () => {
    it.each([
      ["a", "YQ=="],
      ["b", "Yg=="],
      [
        "the quick brown fox jumps over the lazy dog -_=*%^",
        "dGhlIHF1aWNrIGJyb3duIGZveCBqdW1wcyBvdmVyIHRoZSBsYXp5IGRvZyAtXz0qJV4=",
      ],
    ])("encodes %p to %p", (str, expected) => {
      expect(encode(str)).toBe(expected);
    });
  });
});
