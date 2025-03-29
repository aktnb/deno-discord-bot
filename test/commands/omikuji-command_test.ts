import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { OmikujiCommand } from "../../commands/omikuji-command.ts";

Deno.test("getRandomOmikuji produces the same result for the same seed", () => {
  const seed = "this is seed";
  const sut = new OmikujiCommand();
  const result1 = sut.getRandomOmikuji(seed);
  const result2 = sut.getRandomOmikuji(seed);
  assertEquals(result1, result2);
});
