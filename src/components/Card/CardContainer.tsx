import type { Card } from '../../types/card';
import { LiveActivityCard } from './LiveActivityCard';

interface CardContainerProps {
  card: Card;
}

export function CardContainer({ card }: CardContainerProps) {
  return <LiveActivityCard card={card} />;
}
