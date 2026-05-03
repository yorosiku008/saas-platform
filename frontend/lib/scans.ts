import { api } from "./api"

export type Product = "finops" | "cloudguard" | "infrascore" | "supplyguard" | "zerovis"
export type ScanStatus = "pending" | "running" | "completed" | "failed"

export interface Scan {
  id: string
  product: Product
  status: ScanStatus
  result: Record<string, unknown> | null
  report_url: string | null
  created_at: string
  completed_at: string | null
}

export const PRODUCT_LABELS: Record<Product, string> = {
  finops: "FinOps JP",
  cloudguard: "CloudGuard JP",
  infrascore: "InfraScore JP",
  supplyguard: "SupplyGuard JP",
  zerovis: "ZeroVis JP",
}

export async function createScan(product: Product, demo = true, awsConnectionId?: string): Promise<Scan> {
  const { data } = await api.post<Scan>("/scans/", {
    product,
    demo_mode: demo,
    aws_connection_id: awsConnectionId,
  })
  return data
}

export async function listScans(product?: Product): Promise<Scan[]> {
  const params = product ? { product } : {}
  const { data } = await api.get<Scan[]>("/scans/", { params })
  return data
}

export async function getScan(id: string): Promise<Scan> {
  const { data } = await api.get<Scan>(`/scans/${id}`)
  return data
}
