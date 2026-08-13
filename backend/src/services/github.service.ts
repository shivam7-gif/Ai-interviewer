import axios from "axios";
import type { GitHubRepo } from "../types/index.js";

/**
 * Extracts the GitHub username from a GitHub profile or repo URL.
 *
 * Handles all common formats:
 *   https://github.com/username
 *   https://github.com/username/
 *   https://github.com/username/repo
 *   https://github.com/username/repo.git
 *   git@github.com:username/repo.git
 */
export function extractGitHubUsername(url: string): string {
  // Normalise: trim whitespace and trailing slash
  const trimmed = url.trim().replace(/\/+$/, "");

  // Handle SSH format: git@github.com:username/repo.git
  const sshMatch = trimmed.match(/^git@github\.com:([^/]+)/i);
  if (sshMatch && sshMatch[1]) {
    return sshMatch[1].replace(/\.git$/i, "");
  }

  // Handle HTTPS format: https://github.com/username[/repo[.git]]
  let pathname: string;
  try {
    const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    pathname = parsed.pathname; // e.g. "/username" or "/username/repo.git"
  } catch {
    throw new Error(`Invalid GitHub URL: "${url}"`);
  }

  // Split on "/" and take the first non-empty segment → that's the username
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  if (!firstSegment) {
    throw new Error(`Could not extract GitHub username from URL: "${url}"`);
  }

  // The username is always the first path segment; strip any accidental .git suffix
  const username = firstSegment.replace(/\.git$/i, "");

  if (!username) {
    throw new Error(`Could not extract GitHub username from URL: "${url}"`);
  }

  return username;
}

/**
 * Fetches public repositories for a given GitHub username.
 */
export async function fetchGitHubRepos(username: string): Promise<GitHubRepo[]> {
  const response = await axios.get(
    `https://api.github.com/users/${username}/repos`,
    {
      headers: process.env.GITHUB_TOKEN
        ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
        : {},
      params: { sort: "updated", per_page: 30 },
    }
  );

  return response.data.map((repo: any) => ({
    description: repo.description ?? null,
    name: repo.name,
    fullName: repo.full_name,
    starcount: repo.stargazers_count,
  }));
}
