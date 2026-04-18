describe("emailService", () => {
  it("builds application status emails and maps hired to selected", async () => {
    const { buildApplicationStatusEmail } = await import("../../src/services/emailService");

    const result = buildApplicationStatusEmail({
      candidateName: "Candidate Name",
      jobTitle: "Senior Developer",
      status: "Hired",
    });

    expect(result.subject).toContain("Selected");
    expect(result.html).toContain("Candidate Name");
    expect(result.html).toContain("Senior Developer");
    expect(result.html).toContain("Selected");
  });
});
