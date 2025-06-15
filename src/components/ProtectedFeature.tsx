
import React from 'react';
import { useSubscription } from '../hooks/useSubscription';
import SubscriptionBlock from './SubscriptionBlock';

interface ProtectedFeatureProps {
  children: React.ReactNode;
  feature: string;
  onUpgrade?: () => void;
}

export default function ProtectedFeature({ children, feature, onUpgrade }: ProtectedFeatureProps) {
  const { canAccessFeatures, loading } = useSubscription();

  console.log('🛡️ ProtectedFeature:', { feature, canAccessFeatures, loading });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!canAccessFeatures) {
    return <SubscriptionBlock feature={feature} onUpgrade={onUpgrade} />;
  }

  return <>{children}</>;
}
