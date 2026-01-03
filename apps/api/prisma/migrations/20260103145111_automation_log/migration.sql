-- CreateTable
CREATE TABLE "AutomationDeliveryLog" (
    "id" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "followMsgSent" BOOLEAN NOT NULL DEFAULT false,
    "followMsgRead" BOOLEAN NOT NULL DEFAULT false,
    "followConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "openingMsgSent" BOOLEAN NOT NULL DEFAULT false,
    "openingMsgRead" BOOLEAN NOT NULL DEFAULT false,
    "openingClicked" BOOLEAN NOT NULL DEFAULT false,
    "emailReqSent" BOOLEAN NOT NULL DEFAULT false,
    "emailProvided" BOOLEAN NOT NULL DEFAULT false,
    "linkMsgSent" BOOLEAN NOT NULL DEFAULT false,
    "linkMsgRead" BOOLEAN NOT NULL DEFAULT false,
    "linkClicked" BOOLEAN NOT NULL DEFAULT false,
    "followUpSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationDeliveryLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AutomationDeliveryLog_flowId_contactId_idx" ON "AutomationDeliveryLog"("flowId", "contactId");

-- AddForeignKey
ALTER TABLE "AutomationDeliveryLog" ADD CONSTRAINT "AutomationDeliveryLog_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "Flow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationDeliveryLog" ADD CONSTRAINT "AutomationDeliveryLog_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationDeliveryLog" ADD CONSTRAINT "AutomationDeliveryLog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
