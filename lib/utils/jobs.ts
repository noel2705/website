export const jobsMultiplier = {
    miner: 0.15,
    woodcutter: 0.1874,
    digger: 0.11579,
    hunter: 0.226666,
    farmer: 1.5,
    fisherman: 1.5,
    builder: 0.01,
} as const;

export type JobName = keyof typeof jobsMultiplier;

export const jobLabels: Record<JobName, string> = {
    miner: 'Minenarbeiter',
    woodcutter: 'Holzfäller',
    digger: 'Gräber',
    hunter: 'Jäger',
    farmer: 'Bauer',
    fisherman: 'Fischer',
    builder: 'Builder'
};

export enum JobMaxMoney {
    miner = 20,
    woodcutter = 25,
    digger = 25,
    hunter = 68,
    farmer = 25,
    fisherman = 100,
    builder = 25,
}

export enum JobBaseMoney {
    miner = 0,
    woodcutter = 4,
    digger = 0,
    hunter = 0,
    farmer = 0,
    fisherman = 20,
    builder = 0,
}

const defaultMaxMoney = 25.0;

export class JobSystem {

    getJobMoney(jobName: JobName, jobLevel: number): number {
        if (jobName === 'fisherman') {
            const base = JobBaseMoney.fisherman;
            const increment = jobsMultiplier[jobName];
            const money = base + Math.max(jobLevel - 1, 0) * increment;
            return Math.min(money, JobMaxMoney[jobName] ?? defaultMaxMoney);
        }

        if (jobName !== 'woodcutter') {
            const multiplier = jobsMultiplier[jobName];
            return Math.min(multiplier * jobLevel, JobMaxMoney[jobName] ?? defaultMaxMoney);
        }

        const base = JobBaseMoney.woodcutter;

        const earlyLevels = Math.min(jobLevel - 1, 28);
        const lateLevels = Math.max(jobLevel - 29, 0);

        const money =
            base +
            earlyLevels * 0.1874 +
            lateLevels * 0.12;

        return Math.min(money, JobMaxMoney[jobName] ?? defaultMaxMoney);
    }

    getJobXP(jobLevel: number): number {
        const xp = 800 * (1.25 ** jobLevel);
        return jobLevel >= 37 ? 2_500_000 : Math.round(xp);
    }

    getJobLabel(jobName: JobName): string {
        return jobLabels[jobName];
    }

    getLabels(): Record<JobName, string> {
        return jobLabels;
    }
}
