export interface DeviceInfo {
    /** Name of the panel */
    product: string | undefined;
    vendorId: number;
    productId: number;
    interface: number | null;
}