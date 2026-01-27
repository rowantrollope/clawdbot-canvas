import type { Card } from '../../types/card';
import { NotificationCard } from './NotificationCard';
import { LiveActivityCard } from './LiveActivityCard';

interface CardContainerProps {
  card: Card;
}

export function CardContainer({ card }: CardContainerProps) {
  if (card.presentation === 'notification') {
    return <NotificationCard card={card} />;
  }
  return <LiveActivityCard card={card} />;
}
