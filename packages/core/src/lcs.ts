/**
 * Calculates the Longest Common Subsequence (LCS) of two arrays.
 * This function uses dynamic programming.
 *
 * @param a The first array.
 * @param b The second array.
 * @param compareFn Optional comparison function. Defaults to strict equality (===).
 * @returns A 2D array where dp[i][j] is the length of the LCS of a.slice(0, i) and b.slice(0, j).
 */
export function lcs<T>(a: T[], b: T[], compareFn?: (a: T, b: T) => boolean): number[][] {
    const dp: number[][] = Array(a.length + 1)
        .fill(null)
        .map(() => Array(b.length + 1).fill(0));

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const equal = compareFn ? compareFn(a[i - 1], b[j - 1]) : a[i - 1] === b[j - 1];
            if (equal) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp;
}
