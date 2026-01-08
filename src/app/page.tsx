'use client';

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import {
    Menu,
    X,
    ArrowRight,
    CheckCircle,
    AlertTriangle,
    Clock,
    DollarSign,
    Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
    const t = useTranslations('home');
    const tAuth = useTranslations('auth');
    const tCommon = useTranslations('common');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans">
            {/* Header */}
            <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-600 p-1.5 rounded-lg">
                                <DollarSign className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-gray-900">
                                {tCommon('appName')}
                            </span>
                        </div>

                        {/* Desktop nav */}
                        <nav className="hidden md:flex items-center gap-6">
                            <Link href="#problem" className="text-sm font-medium text-gray-600 hover:text-gray-900">Problem</Link>
                            <Link href="#solution" className="text-sm font-medium text-gray-600 hover:text-gray-900">Solution</Link>
                            <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900">Pricing</Link>
                            <Link
                                href="/login"
                                className="text-sm font-medium text-gray-600 hover:text-gray-900"
                            >
                                {tAuth('login')}
                            </Link>
                            <Link href="/dashboard">
                                <Button>{t('hero.getStarted')}</Button>
                            </Link>
                        </nav>

                        {/* Mobile menu button */}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-expanded={mobileMenuOpen}
                            aria-controls="mobile-nav"
                            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                            className="md:hidden p-2 text-gray-600"
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile nav */}
                {mobileMenuOpen && (
                    <div id="mobile-nav" className="md:hidden border-t border-gray-100 bg-white">
                        <nav className="px-4 sm:px-6 py-4 space-y-3">
                            <Link
                                href="#problem"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block text-sm font-medium text-gray-600 hover:text-gray-900"
                            >
                                Problem
                            </Link>
                            <Link
                                href="#solution"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block text-sm font-medium text-gray-600 hover:text-gray-900"
                            >
                                Solution
                            </Link>
                            <Link
                                href="#pricing"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block text-sm font-medium text-gray-600 hover:text-gray-900"
                            >
                                Pricing
                            </Link>

                            <div className="pt-3 flex flex-col gap-2">
                                <Link
                                    href="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                                >
                                    {tAuth('login')}
                                </Link>
                                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                                    <Button className="w-full">{t('hero.getStarted')}</Button>
                                </Link>
                            </div>
                        </nav>
                    </div>
                )}
            </header>

            <main>
                {/* Hero Section */}
                <section className="py-20 sm:py-32 bg-gradient-to-br from-gray-50 to-white overflow-hidden relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                        <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 mb-8">
                            <span>{t('whyNow.p4')}</span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
                            {t('hero.title')}
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                            {t('hero.subtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/dashboard">
                                <Button size="lg" className="h-12 px-8 text-base">
                                    {t('hero.getStarted')} <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="#solution">
                                <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                                    {t('hero.learnMore')}
                                </Button>
                            </Link>
                        </div>
                        <p className="mt-6 text-sm text-gray-500">{t('whyNow.conclusion')}</p>
                    </div>

                    {/* Abstract background blobs */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-100 rounded-full blur-3xl opacity-30"></div>
                </section>

                {/* Problem Section */}
                <section id="problem" className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('problem.title')}</h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">{t('problem.p1')}</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <ProblemCard
                                icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
                                text={t('problem.p2')}
                            />
                            <ProblemCard
                                icon={<Clock className="h-6 w-6 text-orange-600" />}
                                text={t('problem.p5')}
                            />
                            <ProblemCard
                                icon={<DollarSign className="h-6 w-6 text-red-600" />}
                                text={t('problem.p3')}
                            />
                        </div>

	                        <div className="mt-12 text-center bg-white p-6 rounded-2xl shadow-sm border border-red-100 max-w-2xl mx-auto">
	                            <p className="text-red-600 font-semibold italic">
	                                &ldquo;{t('problem.quote')}&rdquo;
	                            </p>
	                        </div>
                    </div>
                </section>

                {/* Product / Solution Section */}
                <section id="solution" className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('solution.title')}</h2>
                                <p className="text-lg text-gray-600 mb-8">{t('solution.description')}</p>
                                <div className="space-y-4">
                                    <FeatureItem text={t('solution.f1')} />
                                    <FeatureItem text={t('solution.f2')} />
                                    <FeatureItem text={t('solution.f3')} />
                                    <FeatureItem text={t('solution.f4')} />
                                </div>
                            </div>
                            <div className="bg-gray-100 rounded-2xl p-8 border border-gray-200">
                                <h3 className="text-xl font-bold mb-6">{t('product.title')}</h3>
                                <div className="grid gap-4">
                                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                                        <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                            <span className="text-gray-700 font-medium">{t(`product.f${i}`)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-20 bg-gray-900 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4">{t('pricing.title')}</h2>
                            <p className="text-gray-400">Transparent pricing for local businesses.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {/* Starter */}
                            <PricingCard
                                title={t('pricing.starter.title')}
                                price={t('pricing.starter.price')}
                                period={t('pricing.starter.period')}
                                description={t('pricing.starter.description')}
                                features={[t('pricing.starter.f1'), t('pricing.starter.f2')]}
                            />

                            {/* Business */}
                            <PricingCard
                                title={t('pricing.business.title')}
                                price={t('pricing.business.price')}
                                period={t('pricing.business.period')}
                                description={t('pricing.business.description')}
                                features={[t('pricing.business.f1'), t('pricing.business.f2'), t('pricing.business.f3')]}
                                highlighted
                            />

                            {/* Enterprise */}
                            <PricingCard
                                title={t('pricing.enterprise.title')}
                                price={t('pricing.enterprise.price')}
                                period={t('pricing.enterprise.period')}
                                description={t('pricing.enterprise.description')}
                                features={[t('pricing.enterprise.f1'), t('pricing.enterprise.f2'), t('pricing.enterprise.f3')]}
                            />
                        </div>

                        <div className="mt-12 text-center text-gray-400 text-sm bg-gray-800/50 p-4 rounded-lg max-w-md mx-auto">
                            <p className="font-semibold text-white mb-1">{t('pricing.addon.title')}</p>
                            <p>{t('pricing.addon.description')}</p>
                        </div>
                    </div>
                </section>

                {/* Vision / Footer */}
                <section className="py-20 text-center">
                    <div className="max-w-3xl mx-auto px-4">
                        <Shield className="h-12 w-12 text-blue-600 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('vision.tagline')}</h2>
                        <p className="text-gray-600 leading-relaxed mb-8">{t('vision.text')}</p>
                    </div>
                </section>
            </main>

            <footer className="border-t border-gray-200 py-8 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
                    <p>{t('footer.tagline')}</p>
                    <p className="mt-2">{t('footer.compliance')}</p>
                </div>
            </footer>
        </div>
    );
}

function ProblemCard({ icon, text }: { icon: React.ReactNode, text: string }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="mb-4 p-3 bg-red-50 rounded-full">{icon}</div>
            <p className="text-gray-900 font-medium">{text}</p>
        </div>
    )
}

function FeatureItem({ text }: { text: string }) {
    return (
        <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-blue-600 shrink-0" />
            <span className="text-gray-700 font-medium">{text}</span>
        </div>
    )
}

interface PricingProps {
    title: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    highlighted?: boolean;
}

function PricingCard({ title, price, period, description, features, highlighted = false }: PricingProps) {
    return (
        <div className={`rounded-2xl p-8 border ${highlighted ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-600/20' : 'bg-gray-800 border-gray-700 text-white'}`}>
            <h3 className="text-lg font-semibold mb-2 opacity-90">{title}</h3>
            <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold">{price}</span>
                <span className={`text-sm ${highlighted ? 'text-blue-100' : 'text-gray-400'}`}>{period}</span>
            </div>
            <p className={`text-sm mb-6 ${highlighted ? 'text-blue-100' : 'text-gray-400'}`}>{description}</p>

            <ul className="space-y-3 mb-8">
                {features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                        <CheckCircle className={`h-4 w-4 ${highlighted ? 'text-blue-200' : 'text-blue-500'}`} />
                        <span>{f}</span>
                    </li>
                ))}
            </ul>

            <Button className={`w-full ${highlighted ? 'bg-white text-blue-600 hover:bg-gray-50' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
                Choose Plan
            </Button>
        </div>
    )
}
