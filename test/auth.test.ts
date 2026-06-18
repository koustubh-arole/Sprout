import { describe, it, expect, beforeEach } from "vitest";
import { useAuth } from "@/lib/authStore";

beforeEach(() => {
  useAuth.setState({ users: {}, sessionEmail: null, isGuest: false });
});

describe("authStore", () => {
  it("signs up, then logs in with the same credentials", async () => {
    const up = await useAuth.getState().signUp("Koustubh", "k@example.com", "secret1");
    expect(up.ok).toBe(true);
    expect(useAuth.getState().sessionEmail).toBe("k@example.com");

    useAuth.getState().logOut();
    expect(useAuth.getState().sessionEmail).toBeNull();

    const inn = await useAuth.getState().logIn("k@example.com", "secret1");
    expect(inn.ok).toBe(true);
    expect(useAuth.getState().sessionEmail).toBe("k@example.com");
  });

  it("rejects a wrong password", async () => {
    await useAuth.getState().signUp("K", "wrong@example.com", "secret1");
    useAuth.getState().logOut();
    const r = await useAuth.getState().logIn("wrong@example.com", "nope123");
    expect(r.ok).toBe(false);
  });

  it("rejects a duplicate email", async () => {
    await useAuth.getState().signUp("A", "dup@example.com", "secret1");
    const r = await useAuth.getState().signUp("B", "dup@example.com", "secret2");
    expect(r.ok).toBe(false);
  });

  it("validates input", async () => {
    expect((await useAuth.getState().signUp("", "a@b.com", "secret1")).ok).toBe(false);
    expect((await useAuth.getState().signUp("A", "bad-email", "secret1")).ok).toBe(false);
    expect((await useAuth.getState().signUp("A", "a@b.com", "123")).ok).toBe(false);
  });

  it("continueAsGuest sets a guest session", () => {
    useAuth.getState().continueAsGuest();
    expect(useAuth.getState().isGuest).toBe(true);
  });
});
