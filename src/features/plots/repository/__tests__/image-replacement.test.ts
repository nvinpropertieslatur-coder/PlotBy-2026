import { commitStagedReplacement } from '../image-replacement';

describe('failure-safe image replacement', () => {
  it('removes staged images but preserves existing images when the database transaction fails', async () => {
    const events: string[] = [];
    await expect(commitStagedReplacement({
      stage: async () => { events.push('stage-new'); return ['new']; },
      commit: async () => { events.push('commit'); throw new Error('transaction failed'); },
      removeStaged: async () => { events.push('remove-new'); },
      removeOld: async () => { events.push('remove-old'); },
    })).rejects.toThrow('transaction failed');
    expect(events).toEqual(['stage-new', 'commit', 'remove-new']);
  });

  it('removes old images only after the database transaction commits', async () => {
    const events: string[] = [];
    await commitStagedReplacement({
      stage: async () => { events.push('stage-new'); return ['new']; },
      commit: async () => { events.push('commit'); },
      removeStaged: async () => { events.push('remove-new'); },
      removeOld: async () => { events.push('remove-old'); },
    });
    expect(events).toEqual(['stage-new', 'commit', 'remove-old']);
  });
});
