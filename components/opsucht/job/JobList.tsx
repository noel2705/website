'use client';
import {useMemo, useState} from "react";
import {JobMaxMoney, JobName, JobSystem} from "@/lib/utils/jobs";
import '@/components/css/job/JobList.css';

const jobImages: Record<JobName, string> = {
    miner: 'https://img.mc-api.io/diamond_pickaxe.png',
    woodcutter: 'https://img.mc-api.io/diamond_axe.png',
    digger: 'https://img.mc-api.io/diamond_shovel.png',
    hunter: 'https://img.mc-api.io/diamond_sword.png',
    farmer: 'https://img.mc-api.io/wheat.png',
    fisherman: 'https://img.mc-api.io/fishing_rod.png',
    builder: 'https://img.mc-api.io/bricks.png',
};

export default function JobList() {
    const jobSystem = new JobSystem();
    const labels = jobSystem.getLabels();
    const jobs = Object.entries(labels) as Array<[JobName, string]>;
    const [selectedJob, setSelectedJob] = useState<JobName | null>(null);

    const jobMaxMoney = (jobKey: JobName) => JobMaxMoney[jobKey];
    const getMaxLevel = (jobKey: JobName) => {
        const maxMoney = jobMaxMoney(jobKey);
        let level = 1;
        while (level < 200 && jobSystem.getJobMoney(jobKey, level) < maxMoney) {
            level += 1;
        }
        return level;
    };

    const selectedMaxLevel = useMemo(
        () => (selectedJob ? getMaxLevel(selectedJob) : 0),
        [selectedJob]
    );

    return (
        <section className="job-selection">
            <div className="job-selection__grid">
                {jobs.map(([key, value]) => (
                    <button
                        key={key}
                        type="button"
                        className="job-card"
                        onClick={() => setSelectedJob(key)}
                        aria-label={`${value} anzeigen`}
                    >
                        <div className="job-card__image">
                            <img src={jobImages[key]} alt="" />
                        </div>
                        <div className="job-card__title">{value}</div>
                        <div className="job-card__cta">Öffnen</div>
                    </button>
                ))}
            </div>

            {selectedJob && (
                <div className="job-modal" role="dialog" aria-modal="true">
                    <button
                        type="button"
                        className="job-modal__backdrop"
                        onClick={() => setSelectedJob(null)}
                        aria-label="Schließen"
                    />
                    <div className="job-modal__content">
                        <div className="job-modal__header">
                            <div className="job-modal__title">{labels[selectedJob]}</div>
                            <button
                                type="button"
                                className="job-modal__close"
                                onClick={() => setSelectedJob(null)}
                                aria-label="Schließen"
                            >
                                ×
                            </button>
                        </div>

                        <table className="job-table job-table--single">
                            <thead>
                                <tr>
                                    <th className="job-table__rowhead">Lvl</th>
                                    <th className="job-table__subhead">€</th>
                                    <th className="job-table__subhead">XP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...Array(selectedMaxLevel)].map((_, index) => (
                                    <tr key={index}>
                                        <td className="job-table__rowhead">Lvl {index + 1}</td>
                                        <td>
                                            {Math.min(
                                                jobSystem.getJobMoney(selectedJob, index + 1),
                                                jobMaxMoney(selectedJob)
                                            ).toFixed(2)}
                                        </td>
                                        <td>{jobSystem.getJobXP(index + 1).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </section>
    )
}
