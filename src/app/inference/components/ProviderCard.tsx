'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import {
    MessageCircle,
    Code,
    Copy,
    AlertCircle,
    Loader2,
    Clock,
    TrendingDown,
    Scale,
    Image,
    Mic,
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn, copyToClipboard } from '@/lib/utils'
import type { Provider } from '@/shared/types/broker'

interface ProviderCardProps {
    provider: Provider
    isOfficial: boolean
    isLoading?: boolean
    isRecentlyUsed?: boolean
    usageCount?: number
    isCheapest?: boolean
    onChat?: (provider: Provider) => void
    onBuild?: (provider: Provider) => void
    onImageGen?: (provider: Provider) => void
    onSpeechToText?: (provider: Provider) => void
    isSelectedForCompare?: boolean
    onToggleCompare?: (address: string) => void
}

export function ProviderCard({
    provider,
    isOfficial,
    isLoading = false,
    isRecentlyUsed = false,
    usageCount,
    isCheapest = false,
    onChat,
    onBuild,
    onImageGen,
    onSpeechToText,
    isSelectedForCompare = false,
    onToggleCompare,
}: ProviderCardProps) {
    const isVerified = provider.teeSignerAcknowledged ?? false
    const isDisabled = !isVerified

    // Determine service type category for UI display
    // Handle various image-related service types
    const isImageService = provider.serviceType === 'text-to-image' ||
        provider.serviceType?.includes('image') ||
        provider.name?.toLowerCase().includes('image')
    const isChatService = provider.serviceType === 'chatbot'
    const isSpeechService = provider.serviceType === 'speech-to-text'

    const copyAddress = async () => {
        await copyToClipboard(provider.address)
    }

    const truncatedAddress = `${provider.address.slice(0, 8)}...${provider.address.slice(-6)}`

    return (
        <Card
            className={cn(
                'relative transition-shadow',
                isDisabled
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:shadow-lg cursor-pointer'
            )}
        >
            <CardContent className="p-5">
                {/* Top right actions */}
                <div className="absolute top-2 right-2 flex items-center gap-2">
                    {/* Loading indicator */}
                    {isLoading && (
                        <Loader2 className="h-3 w-3 animate-spin text-purple-600" />
                    )}
                    {/* Compare checkbox */}
                    {onToggleCompare && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div
                                    className={cn(
                                        "flex items-center gap-1 px-1.5 py-1 rounded-md cursor-pointer transition-colors",
                                        isSelectedForCompare
                                            ? "bg-purple-100 text-purple-600"
                                            : "hover:bg-gray-100 text-gray-400"
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onToggleCompare(provider.address)
                                    }}
                                >
                                    <Scale className="h-3.5 w-3.5" />
                                    <Checkbox
                                        checked={isSelectedForCompare}
                                        className="h-3.5 w-3.5 border-current data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{isSelectedForCompare ? 'Remove from comparison' : 'Add to comparison'}</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>

                {/* Header with name and badges */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-base font-semibold text-gray-900 truncate">
                                {provider.name}
                            </h3>
                            {isOfficial && (
                                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-0 px-1.5 py-0.5 text-xs">
                                    0G
                                </Badge>
                            )}
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0 px-1.5 py-0.5 text-xs">
                                {provider.verifiability}
                            </Badge>
                            {!isVerified && (
                                <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-0 px-1.5 py-0.5 text-xs">
                                    Unverified
                                </Badge>
                            )}
                            {isRecentlyUsed && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-0 px-1.5 py-0.5 text-xs flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Recently Used{usageCount && usageCount > 1 ? ` (${usageCount}x)` : ''}
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>You&apos;ve used this provider recently</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                            {isCheapest && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0 px-1.5 py-0.5 text-xs flex items-center gap-1">
                                            <TrendingDown className="h-3 w-3" />
                                            Cheapest
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Lowest price among available providers</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>

                        {/* Pricing and address */}
                        <div className="flex items-center gap-2 flex-wrap min-h-[28px]">
                            {/* Pricing section - improved clarity */}
                            {(provider.inputPrice !== undefined ||
                                provider.outputPrice !== undefined) && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-2 text-xs bg-gray-50 px-2 py-1 rounded cursor-help">
                                            {isImageService ? (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-gray-600">Price:</span>
                                                    <span className="font-semibold text-gray-900">
                                                        {provider.outputPrice?.toFixed(4)} 0G/image
                                                    </span>
                                                </div>
                                            ) : (
                                                <>
                                                    {provider.inputPrice !== undefined && (
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-gray-600">Input:</span>
                                                            <span className="font-semibold text-gray-900">
                                                                {provider.inputPrice.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {provider.outputPrice !== undefined && (
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-gray-600">Output:</span>
                                                            <span className="font-semibold text-gray-900">
                                                                {provider.outputPrice.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <span className="text-gray-500">0G/1M tokens</span>
                                                </>
                                            )}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                        <div className="text-sm">
                                            <p className="font-semibold mb-1">Pricing Details</p>
                                            {isImageService ? (
                                                <p>Cost per generated image: {provider.outputPrice?.toFixed(4)} 0G</p>
                                            ) : (
                                                <>
                                                    {provider.inputPrice !== undefined && (
                                                        <p>Input (what you send): {provider.inputPrice.toFixed(4)} 0G per 1M tokens</p>
                                                    )}
                                                    {provider.outputPrice !== undefined && (
                                                        <p>Output (AI response): {provider.outputPrice.toFixed(4)} 0G per 1M tokens</p>
                                                    )}
                                                    <p className="text-gray-400 mt-1 text-xs">~{((provider.inputPrice || 0) + (provider.outputPrice || 0)).toFixed(4)} 0G per typical message</p>
                                                </>
                                            )}
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            )}

                            {/* Address with copy */}
                            <div className="flex items-center gap-1">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <code className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded cursor-default">
                                            {truncatedAddress}
                                        </code>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{provider.address}</p>
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-gray-400 hover:text-gray-600"
                                            onClick={copyAddress}
                                        >
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Copy address</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-1 mt-1">
                    {isDisabled ? (
                        <>
                            {isChatService && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 text-xs cursor-not-allowed"
                                    disabled
                                >
                                    <MessageCircle className="h-3 w-3 mr-1" />
                                    Chat
                                </Button>
                            )}
                            {isImageService && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 text-xs cursor-not-allowed"
                                    disabled
                                >
                                    <Image className="h-3 w-3 mr-1" />
                                    Generate
                                </Button>
                            )}
                            {isSpeechService && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 text-xs cursor-not-allowed"
                                    disabled
                                >
                                    <Mic className="h-3 w-3 mr-1" />
                                    Transcribe
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-xs cursor-not-allowed"
                                disabled
                            >
                                <Code className="h-3 w-3 mr-1" />
                                Build
                            </Button>
                        </>
                    ) : (
                        <>
                            {isChatService && onChat && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 text-xs text-gray-600 border-gray-300 hover:text-purple-600 hover:bg-purple-50 hover:border-purple-200"
                                    onClick={() => onChat(provider)}
                                >
                                    <MessageCircle className="h-3 w-3 mr-1" />
                                    Chat
                                </Button>
                            )}
                            {isImageService && onImageGen && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 text-xs text-gray-600 border-gray-300 hover:text-purple-600 hover:bg-purple-50 hover:border-purple-200"
                                    onClick={() => onImageGen(provider)}
                                >
                                    <Image className="h-3 w-3 mr-1" />
                                    Generate
                                </Button>
                            )}
                            {isSpeechService && onSpeechToText && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 text-xs text-gray-600 border-gray-300 hover:text-purple-600 hover:bg-purple-50 hover:border-purple-200"
                                    onClick={() => onSpeechToText(provider)}
                                >
                                    <Mic className="h-3 w-3 mr-1" />
                                    Transcribe
                                </Button>
                            )}
                            {onBuild && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 text-xs text-gray-600 border-gray-300 hover:text-purple-600 hover:bg-purple-50 hover:border-purple-200"
                                    onClick={() => onBuild(provider)}
                                >
                                    <Code className="h-3 w-3 mr-1" />
                                    Build
                                </Button>
                            )}
                        </>
                    )}
                </div>

                {/* Unverified notice */}
                {!isVerified && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex items-start">
                            <AlertCircle className="h-3 w-3 text-red-500 mr-1 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-red-700">
                                This provider has not been verified and cannot be used
                                until verification is complete.
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
