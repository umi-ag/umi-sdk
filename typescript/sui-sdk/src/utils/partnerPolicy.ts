import type { TransactionArgument, TransactionBlock } from '@mysten/sui.js';
import { UMIAG_PACKAGE_ID } from '../config';

export type CreateAdminCapArgs = {
  txb: TransactionBlock,
  adminCap: TransactionArgument,
  recipient: TransactionArgument,
};

export const moveCallCreateAdminCap = ({
  txb,
  adminCap,
  recipient,
}: CreateAdminCapArgs) => {
  return txb.moveCall({
    target: `${UMIAG_PACKAGE_ID}::admin_cap::create_admin_cap`,
    arguments: [adminCap, recipient],
  });
};

export type CreatePartnerPolicyArgs = {
  txb: TransactionBlock,
  adminCap: TransactionArgument,
  partnerId: TransactionArgument,
  partnerRecipientAddress: TransactionArgument,
  umiRecipientAddress: TransactionArgument,
  feeBps: TransactionArgument,
  partnerFeeRatioBps: TransactionArgument,
};

export const moveCallCreatePartnerPolicy = ({
  txb,
  adminCap,
  partnerId,
  partnerRecipientAddress,
  umiRecipientAddress,
  feeBps,
  partnerFeeRatioBps,
}: CreatePartnerPolicyArgs) => {
  return txb.moveCall({
    target: `${UMIAG_PACKAGE_ID}::admin_cap::create_partner_policy`,
    arguments: [
      adminCap,
      partnerId,
      partnerRecipientAddress,
      umiRecipientAddress,
      feeBps,
      partnerFeeRatioBps,
    ],
  });
};

export type UpdatePartnerPolicyArgs = {
  txb: TransactionBlock,
  adminCap: TransactionArgument,
  policy: TransactionArgument,
  partnerRecipientAddress: TransactionArgument,
  umiRecipientAddress: TransactionArgument,
  feeBps: TransactionArgument,
  partnerFeeRatioBps: TransactionArgument,
};

export const moveCallUpdatePartnerPolicy = ({
  txb,
  adminCap,
  policy,
  partnerRecipientAddress,
  umiRecipientAddress,
  feeBps,
  partnerFeeRatioBps,
}: UpdatePartnerPolicyArgs) => {
  return txb.moveCall({
    target: `${UMIAG_PACKAGE_ID}::admin_cap::update_partner_policy`,
    arguments: [
      adminCap,
      policy,
      partnerRecipientAddress,
      umiRecipientAddress,
      feeBps,
      partnerFeeRatioBps,
    ],
  });
};
