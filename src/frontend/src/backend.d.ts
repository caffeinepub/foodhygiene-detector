import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface ScanRecord {
    id: bigint;
    verdict: HygieneVerdict;
    score: bigint;
    summary: string;
    timestamp: bigint;
    category: string;
    findings: Array<string>;
    image: ExternalBlob;
}
export enum HygieneVerdict {
    fair = "fair",
    good = "good",
    poor = "poor",
    excellent = "excellent"
}
export interface backendInterface {
    analyzeAndStore(image: ExternalBlob, category: string): Promise<ScanRecord>;
    deleteRecord(id: bigint): Promise<void>;
    getAllRecords(): Promise<Array<ScanRecord>>;
    hasApiKey(): Promise<boolean>;
    setApiKey(key: string): Promise<void>;
}
