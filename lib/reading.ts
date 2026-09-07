import type { ComponentType } from 'react';

export interface ReadingPage {
  id: string;
  chapter: string;
  title: string;
  Content: ComponentType;
}
