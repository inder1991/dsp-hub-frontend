import type { SupportData } from "../types/support";

export const fallbackSupport: SupportData = {
  generatedAt: "preview",
  dspSupport: {
    name: "Alex Johnson",
    role: "DSP support duty engineer",
    rosterStatus: "available",
  },
  services: [
    {
      id: "dev-container",
      name: "Dev container",
      description: "Workspace startup, image build, and local package issues.",
      specialist: { name: "Aisha Khan", role: "DSP workspace support", rosterStatus: "available" },
      issues: [
        { id: "container-wont-start", title: "Dev container will not start", description: "Recover a workspace that stops during startup.", estimatedMinutes: 6 },
        { id: "container-build-fails", title: "Dev container build fails", description: "Review common image and configuration failures.", estimatedMinutes: 8 },
        { id: "python-package-missing", title: "Python package is missing", description: "Confirm the approved package source and image version.", estimatedMinutes: 5 },
      ],
    },
    {
      id: "cyberark",
      name: "CyberArk",
      description: "Credential retrieval, session, and target connection issues.",
      specialist: { name: "Omar Rahman", role: "CyberArk on-call", rosterStatus: "available" },
      issues: [
        { id: "session-unavailable", title: "CyberArk session is unavailable", description: "Restart the session and validate the target account mapping.", estimatedMinutes: 5, guideUrl: "#guide/cyberark/session-unavailable" },
        { id: "credential-expired", title: "Credential has expired", description: "Confirm rotation status and request credential reconciliation.", estimatedMinutes: 7 },
        { id: "target-denied", title: "Target connection is denied", description: "Validate safe membership, platform policy, and target access.", estimatedMinutes: 8 },
      ],
    },
    {
      id: "nexus",
      name: "Nexus",
      description: "Approved Python packages, container images, and repository access.",
      specialist: { name: "Priya Nair", role: "Nexus on-call", rosterStatus: "available" },
      issues: [
        { id: "package-unavailable", title: "Python package unavailable in Nexus", description: "Check the approved repository and package onboarding status.", estimatedMinutes: 6 },
        { id: "pip-authentication", title: "Pip authentication failed", description: "Refresh repository credentials and validate pip configuration.", estimatedMinutes: 5 },
        { id: "image-pull-fails", title: "Container image pull fails", description: "Confirm repository path, image tag, and network access.", estimatedMinutes: 7 },
      ],
    },
    {
      id: "compute",
      name: "Compute",
      description: "DSP VM availability, capacity, disk, and memory issues.",
      specialist: { name: "Daniel Lewis", role: "Compute on-call", rosterStatus: "available" },
      issues: [
        { id: "workspace-unreachable", title: "Workspace or VM is unreachable", description: "Check maintenance status, network path, and VM state.", estimatedMinutes: 7 },
        { id: "out-of-memory", title: "Workload stopped due to memory", description: "Identify memory pressure and right-size the workload.", estimatedMinutes: 8 },
        { id: "disk-full", title: "Workspace disk is full", description: "Locate safe cleanup targets and request capacity if needed.", estimatedMinutes: 8 },
      ],
    },
    {
      id: "cdp",
      name: "CDP",
      description: "Data access, Kerberos, permission, and dataset visibility issues.",
      specialist: { name: "Fatima Ali", role: "CDP on-call", rosterStatus: "available" },
      issues: [
        { id: "permission-denied", title: "CDP permission denied", description: "Confirm entitlement, role mapping, and dataset policy.", estimatedMinutes: 7 },
        { id: "kerberos-expired", title: "Kerberos ticket expired", description: "Renew the ticket and confirm the configured principal.", estimatedMinutes: 5 },
        { id: "dataset-not-visible", title: "Dataset is not visible", description: "Validate the database, schema, and granted access.", estimatedMinutes: 6 },
      ],
    },
    {
      id: "trino",
      name: "Trino",
      description: "Query connection, catalogue availability, and performance issues.",
      specialist: { name: "Rohan Mehta", role: "Trino on-call", rosterStatus: "available" },
      issues: [
        { id: "connection-denied", title: "Trino connection denied", description: "Validate the endpoint, credentials, and network route.", estimatedMinutes: 6 },
        { id: "query-slow", title: "Trino query is slow", description: "Review partition filters, query shape, and current service status.", estimatedMinutes: 9 },
        { id: "catalogue-unavailable", title: "Trino catalogue is unavailable", description: "Check catalogue status and the upstream data platform.", estimatedMinutes: 7 },
      ],
    },
    {
      id: "sas",
      name: "SAS",
      description: "SAS connectivity, libraries, and data transfer issues.",
      specialist: { name: "Maya Thomas", role: "SAS on-call", rosterStatus: "available" },
      issues: [
        { id: "connection-failed", title: "SAS connection failed", description: "Validate the connection profile and network access.", estimatedMinutes: 6 },
        { id: "library-unavailable", title: "SAS library is unavailable", description: "Confirm library assignment and permissions.", estimatedMinutes: 7 },
        { id: "export-failed", title: "Export to SAS failed", description: "Review data types, target location, and transfer limits.", estimatedMinutes: 8 },
      ],
    },
  ],
};
