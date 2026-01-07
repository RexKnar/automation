-- DropIndex
DROP INDEX "Referral_code_key";

-- CreateIndex
CREATE INDEX "Referral_code_idx" ON "Referral"("code");
