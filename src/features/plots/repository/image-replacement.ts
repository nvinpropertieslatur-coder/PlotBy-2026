export async function commitStagedReplacement<T>({
  stage,
  commit,
  removeStaged,
  removeOld,
}: {
  stage: () => Promise<T>;
  commit: (staged: T) => Promise<void>;
  removeStaged: (staged: T) => Promise<void>;
  removeOld: () => Promise<void>;
}): Promise<T> {
  const staged = await stage();
  try {
    await commit(staged);
  } catch (error) {
    await removeStaged(staged).catch(() => undefined);
    throw error;
  }
  await removeOld();
  return staged;
}

