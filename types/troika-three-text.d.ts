declare module 'troika-three-text' {
  import { Mesh } from 'three';

  export class Text extends Mesh {
    text: string;
    anchorX?: string | number;
    anchorY?: string | number;
    fontSize?: number;
    letterSpacing?: number;
    lineHeight?: number;
    maxWidth?: number;
    overflowWrap?: 'normal' | 'break-word';
    textAlign?: 'left' | 'right' | 'center' | 'justify';
    whiteSpace?: 'normal' | 'nowrap';
    color?: string | number;
    material?: any;
    sync?: () => void;
  }
}
