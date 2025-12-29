'use client'

import * as React from 'react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Wallet,
    Coins,
    Users,
    MessageSquare,
    Check,
    ChevronRight,
    Sparkles,
    ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface OnboardingStep {
    id: number
    title: string
    description: string
    icon: React.ReactNode
    action?: React.ReactNode
    completed: boolean
    current: boolean
}

interface OnboardingFlowProps {
    hasBalance?: boolean
    hasProvider?: boolean
    onDepositClick?: () => void
    onSelectProviderClick?: () => void
    onStartChatClick?: () => void
    className?: string
}

export function OnboardingFlow({
    hasBalance = false,
    hasProvider = false,
    onDepositClick,
    onSelectProviderClick,
    onStartChatClick,
    className,
}: OnboardingFlowProps) {
    const { isConnected } = useAccount()

    // Determine current step based on state
    const getCurrentStep = () => {
        if (!isConnected) return 1
        if (!hasBalance) return 2
        if (!hasProvider) return 3
        return 4
    }

    const currentStep = getCurrentStep()

    const steps: OnboardingStep[] = [
        {
            id: 1,
            title: 'Connect Wallet',
            description: 'Link your Web3 wallet to get started',
            icon: <Wallet className="h-5 w-5" />,
            completed: isConnected,
            current: currentStep === 1,
            action: !isConnected ? (
                <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                        <Button
                            onClick={openConnectModal}
                            className="bg-purple-600 hover:bg-purple-700"
                            size="sm"
                        >
                            Connect Wallet
                        </Button>
                    )}
                </ConnectButton.Custom>
            ) : null,
        },
        {
            id: 2,
            title: 'Add Funds',
            description: 'Deposit 0G tokens to your account',
            icon: <Coins className="h-5 w-5" />,
            completed: hasBalance,
            current: currentStep === 2,
            action: isConnected && !hasBalance ? (
                <Button
                    onClick={onDepositClick}
                    className="bg-purple-600 hover:bg-purple-700"
                    size="sm"
                >
                    Add 5 0G
                </Button>
            ) : null,
        },
        {
            id: 3,
            title: 'Choose Provider',
            description: 'Select an AI service provider',
            icon: <Users className="h-5 w-5" />,
            completed: hasProvider,
            current: currentStep === 3,
            action: hasBalance && !hasProvider ? (
                <Button
                    onClick={onSelectProviderClick}
                    variant="outline"
                    className="border-purple-300 text-purple-600 hover:bg-purple-50"
                    size="sm"
                >
                    Browse Providers
                </Button>
            ) : null,
        },
        {
            id: 4,
            title: 'Start Chatting',
            description: 'Begin using decentralized AI',
            icon: <MessageSquare className="h-5 w-5" />,
            completed: false,
            current: currentStep === 4,
            action: hasProvider ? (
                <Button
                    onClick={onStartChatClick}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    size="sm"
                >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Start Chat
                </Button>
            ) : null,
        },
    ]

    // If user has completed onboarding, show a minimal view
    if (isConnected && hasBalance && hasProvider) {
        return (
            <Card className={cn("bg-gradient-to-r from-purple-50 to-blue-50 border-purple-100", className)}>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <Check className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">You&apos;re all set!</h3>
                                <p className="text-sm text-gray-600">Ready to use decentralized AI services</p>
                            </div>
                        </div>
                        <Button
                            onClick={onStartChatClick}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Go to Chat
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className={cn("bg-white border-gray-200", className)}>
            <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    Get Started with 0G Compute
                </CardTitle>
                <CardDescription>
                    Complete these steps to start using decentralized AI
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            className={cn(
                                "flex items-start gap-4 p-4 rounded-lg transition-all",
                                step.current && "bg-purple-50 border border-purple-200",
                                step.completed && "bg-gray-50",
                                !step.current && !step.completed && "opacity-50"
                            )}
                        >
                            {/* Step number/check */}
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                step.completed && "bg-green-100 text-green-600",
                                step.current && !step.completed && "bg-purple-100 text-purple-600",
                                !step.current && !step.completed && "bg-gray-100 text-gray-400"
                            )}>
                                {step.completed ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <span className="text-sm font-medium">{step.id}</span>
                                )}
                            </div>

                            {/* Step content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        step.current ? "text-purple-600" : "text-gray-400"
                                    )}>
                                        {step.icon}
                                    </span>
                                    <h4 className={cn(
                                        "font-medium",
                                        step.completed && "text-green-700",
                                        step.current && "text-purple-900",
                                        !step.current && !step.completed && "text-gray-500"
                                    )}>
                                        {step.title}
                                    </h4>
                                    {step.completed && (
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                            Done
                                        </span>
                                    )}
                                </div>
                                <p className={cn(
                                    "text-sm mt-1",
                                    step.current ? "text-gray-600" : "text-gray-400"
                                )}>
                                    {step.description}
                                </p>
                            </div>

                            {/* Action button */}
                            {step.action && (
                                <div className="flex-shrink-0">
                                    {step.action}
                                </div>
                            )}

                            {/* Arrow to next step */}
                            {index < steps.length - 1 && step.completed && (
                                <ChevronRight className="h-5 w-5 text-gray-300 flex-shrink-0" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Progress indicator */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                        <span>Progress</span>
                        <span>{Math.round(((currentStep - 1) / 4) * 100)}% complete</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// Compact version for showing in sidebar or header
export function OnboardingProgress({
    className,
}: {
    className?: string
}) {
    const { isConnected } = useAccount()

    if (!isConnected) {
        return (
            <div className={cn("flex items-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200", className)}>
                <Wallet className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-amber-700">Connect wallet to get started</span>
                <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                        <Button
                            onClick={openConnectModal}
                            size="sm"
                            variant="outline"
                            className="ml-auto h-7 text-xs border-amber-300 text-amber-700 hover:bg-amber-100"
                        >
                            Connect
                        </Button>
                    )}
                </ConnectButton.Custom>
            </div>
        )
    }

    return null
}
