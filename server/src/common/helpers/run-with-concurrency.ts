export async function runWithConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  limit: number,
): Promise<T[]> {
  const results: T[] = []
  let index = 0

  const workers = Array.from({ length: limit }).map(async () => {
    while (index < tasks.length) {
      const current = index++
      results[current] = await tasks[current]()
    }
  })

  await Promise.all(workers)
  return results
}