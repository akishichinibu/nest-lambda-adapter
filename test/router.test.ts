import { LambdaHandlerRouter } from "src/route";

const r = new LambdaHandlerRouter();

it("test router", async () => {
  r.get("/:id", async () => 1);
  r.post("/prefix/:id1/:id2", async () => 2);
  r.put("/prefix/:id1", async () => 3);

  expect(await r.find("GET", "/{id}")!()).toEqual(1);
  expect(await r.find("GET", "/prefix/{id1}/{id2}")!).toBeNull();
  expect(await r.find("POST", "/prefix/{id1}/{id2}")!()).toEqual(2);
  expect(await r.find("PUT", "/prefix/{id1}")!()).toEqual(3);
  // expect(await r.find("PUT", "/prefix/{id1+}")!()).toEqual(3);
});
