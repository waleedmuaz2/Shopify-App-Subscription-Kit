import { useState, useEffect } from "react";
import {
    Card,
    Layout,
    Page,
    Text,
    Button,
    BlockStack,
    InlineStack,
    Box,
    Badge,
    Icon,
    Spinner,
    Modal,
    Checkbox,
} from "@shopify/polaris";
import { CheckCircleIcon, XCircleIcon } from '@shopify/polaris-icons';
import { SubscriptionPlan } from "../types";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { Plan } from "@prisma/client";


export function SubscriptionPlans() {
    const { plans } = useLoaderData<{ plans: Plan[] }>();
    const { subscription } = useLoaderData<{ subscription: any }>();
    const submit = useSubmit();
    const [isLoading, setIsLoading] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
    const [modalAction, setModalAction] = useState<'subscribe' | 'cancel'>('subscribe');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);

    // Format date to be more readable
    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString();
    };

    useEffect(() => {
        if (plans) {
            setIsLoading(false);
        }
    }, [plans]);

    const handleSubscribe = async (plan: SubscriptionPlan) => {
        setSelectedPlan(plan);
        setModalAction('subscribe');
        setShowConfirmModal(true);
    };

    const handleCancel = () => {
        setModalAction('cancel');
        setShowConfirmModal(true);
    };

    const handleConfirmAction = async () => {
        if (!termsAccepted) return;

        setIsConfirming(true);

        if (modalAction === 'subscribe' && selectedPlan) {
            const formData = new FormData();
            const plan = plans.find(p => p.code === selectedPlan);
            formData.append("plan", plan?.code || "");
            try {
                const response = await fetch('/api/subscription', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                if (data.confirmationUrl) {
                    window.open(data.confirmationUrl, '_blank');
                } else if (data.subscription) {
                    window.location.reload();
                }
            } catch (error) {
                console.error('Subscription error:', error);
            }
        } else if (modalAction === 'cancel') {
            submit(null, { method: "DELETE" });
        }

        setIsConfirming(false);
        setShowConfirmModal(false);
        setTermsAccepted(false);
    };

    const getPaymentStatus = () => {
        if (!subscription) return null;
        if (subscription.plan === "FREE") return null;

        switch (subscription.paymentStatus) {
            case "PENDING":
                return (
                    <Text as="p" variant="bodyMd" tone="caution">
                        Payment pending. Please complete payment to activate your subscription.
                    </Text>
                );
            case "FAILED":
                return (
                    <Text as="p" variant="bodyMd" tone="critical">
                        Payment failed. Please try again.
                    </Text>
                );
            case "PAID":
                return (
                    <Text as="p" variant="bodyMd" tone="success">
                        Payment successful
                    </Text>
                );
            default:
                return null;
        }
    };

    // New function to display subscription details when payment is paid
    const getSubscriptionDetails = () => {
        if (!subscription || subscription.paymentStatus !== "PAID") return null;

        return (
            <BlockStack gap="200">
                <Text as="p" variant="bodyMd">
                    <strong>Start Date:</strong> {formatDate(subscription.startDate)}
                </Text>
                <Text as="p" variant="bodyMd">
                    <strong>End Date:</strong> {formatDate(subscription.endDate)}
                </Text>
                {subscription.trialEndsAt && (
                    <Text as="p" variant="bodyMd">
                        <strong>Trial End Date:</strong> {formatDate(subscription.trialEndsAt)}
                    </Text>
                )}
            </BlockStack>
        );
    };

    const renderFeatures = (features: any) => {
        // Convert features object to array and sort by order
        const sortedFeatures = Object.entries(features)
            .map(([key, value]) => ({
                key,
                ...value as any
            }))
            .sort((a, b) => a.order - b.order);

        return (
            <BlockStack gap="200">
                {sortedFeatures.map((feature) => (
                    <InlineStack key={feature.key} gap="200" align="start">
                        <Text as="span">
                            {feature.desciption}
                        </Text>
                        {feature.status ? (
                            <Icon
                                source={CheckCircleIcon}
                                tone="success"
                            />
                        ) : (
                            <Icon
                                source={XCircleIcon}
                                tone="critical"
                            />
                        )}
                    </InlineStack>
                ))}
            </BlockStack>
        );
    };

    const getButtonText = (plan: SubscriptionPlan) => {
        if (!subscription) return "Subscribe";

        // For FREE plan
        if (plan === "FREE") {
            if (subscription.plan === "FREE" && subscription.status === "ACTIVE") {
                return "Unsubscribe";
            }
            return "Subscribe";
        }

        // For PREMIUM plan
        if (plan === "PREMIUM") {
            if (subscription.plan === "PREMIUM" && subscription.status !== "CANCELLED") {
                if (subscription.paymentStatus === "PAID") {
                    return "Unsubscribe";
                }
                return "Pay Now";
            }
            return "Subscribe";
        }

        return "Subscribe";
    };

    const getButtonTone = (plan: SubscriptionPlan) => {
        if (!subscription) return "success";

        if (subscription.plan === plan) {
            if (subscription.paymentStatus === "PAID") return "success";
            if (subscription.trialEndsAt && new Date(subscription.trialEndsAt) > new Date()) return "success";
            return "critical";
        }

        return "success";
    };

    const isPlanHighlighted = (plan: SubscriptionPlan) => {
        if (!subscription) return false;

        // Highlight FREE plan if it's active
        if (plan === "FREE" && subscription.plan === "FREE" && subscription.status === "ACTIVE") {
            return true;
        }

        // Highlight PREMIUM plan if it's paid or in trial
        if (plan === "PREMIUM" && subscription.plan === "PREMIUM") {
            if (subscription.paymentStatus === "PAID" || subscription.trialEndsAt && new Date(subscription.trialEndsAt) > new Date()) {
                return true;
            }
        }

        return false;
    };

    if (isLoading) {
        return (
            <Page>
                <Layout>
                    <Layout.Section>
                        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
                            <Card>
                                <div style={{ padding: "2rem", textAlign: "center" }}>
                                    <BlockStack gap="400" align="center">
                                        <Spinner size="large" />
                                        <Text as="p" variant="bodyMd">Loading subscription plans...</Text>
                                    </BlockStack>
                                </div>
                            </Card>
                        </div>
                    </Layout.Section>
                </Layout>
            </Page>
        );
    }

    return (
        <Page>
            <BlockStack gap="400">
                <Layout>
                    <Layout.Section>
                        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
                            <Card>
                                <Text as="h2" variant="headingLg" alignment="center">
                                    Subscription Plans
                                </Text>
                                <BlockStack gap="400">
                                    {subscription && (
                                        <Box paddingBlock="400">
                                            <div style={{ textAlign: "center" }}>
                                                <Badge tone="enabled">
                                                    {subscription.status}
                                                </Badge>
                                                {getSubscriptionDetails()}
                                                {getPaymentStatus()}
                                           </div>
                                        </Box>
                                    )}
                                </BlockStack>
                            </Card>
                        </div>
                    </Layout.Section>

                    <Layout.Section>
                        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
                            <InlineStack gap="400" wrap={false} align="center">
                                {plans?.map((plan) => (
                                    <Card
                                        key={plan.id}
                                        background={isPlanHighlighted(plan.code) ? "bg-surface-selected" : undefined}
                                    >
                                        <BlockStack gap="400">
                                            <Text as="h3" variant="headingMd" alignment="center">
                                                {plan.name}
                                            </Text>
                                            <Text as="p" variant="headingLg" alignment="center">
                                                ${plan.price}/month
                                            </Text>
                                            {renderFeatures(plan.features)}
                                            <div style={{ textAlign: "center" }}>
                                                <Button
                                                    tone={getButtonTone(plan.code) as "success" | "critical" | undefined}
                                                    onClick={() => {
                                                        if (subscription?.plan === plan.code && subscription?.paymentStatus === "PAID" && subscription?.status !== "CANCELLED") {
                                                            handleCancel();
                                                        } else {
                                                            handleSubscribe(plan.code);
                                                        }
                                                    }}
                                                >
                                                    {getButtonText(plan.code)}
                                                </Button>
                                            </div>
                                        </BlockStack>
                                    </Card>
                                ))}
                            </InlineStack>
                        </div>
                    </Layout.Section>
                </Layout>
            </BlockStack>

            <Modal
                open={showConfirmModal}
                onClose={() => {
                    setShowConfirmModal(false);
                    setTermsAccepted(false);
                }}
                title={modalAction === 'subscribe' ? "Confirm Subscription" : "Confirm Cancellation"}
                primaryAction={{
                    content: isConfirming 
                        ? modalAction === 'subscribe' ? "Processing..." : "Cancelling..." 
                        : modalAction === 'subscribe' ? "Subscribe" : "Cancel Subscription",
                    onAction: handleConfirmAction,
                    destructive: modalAction === 'cancel',
                    disabled: !termsAccepted || isConfirming
                }}
                secondaryActions={[
                    {
                        content: "Back",
                        onAction: () => {
                            setShowConfirmModal(false);
                            setTermsAccepted(false);
                        },
                        disabled: isConfirming
                    }
                ]}
            >
                <Modal.Section>
                    <BlockStack gap="400">
                        <Text as="p">
                            {modalAction === 'subscribe'
                                ? "Are you sure you want to subscribe to this plan?"
                                : "Are you sure you want to cancel your subscription? This action cannot be undone."}
                        </Text>
                        <Checkbox
                            label="I agree to the terms and conditions and privacy policy"
                            checked={termsAccepted}
                            onChange={setTermsAccepted}
                            error={!termsAccepted && "You must accept the terms and conditions to continue"}
                        />
                    </BlockStack>
                </Modal.Section>
            </Modal>
        </Page>
    );
}