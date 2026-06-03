import { Injectable, signal } from '@angular/core';

interface ConfirmConfig {
    titulo: string;
    mensaje: string;
    textoConfirmar?: string;
    tipo?: 'peligro' | 'normal';
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
    mostrar = signal(false);
    config = signal<ConfirmConfig>({ titulo: '', mensaje: '' });
    private _onConfirm: (() => void) | null = null;

    confirm(cfg: ConfirmConfig, onConfirm: () => void) {
        this.config.set(cfg);
        this._onConfirm = onConfirm;
        this.mostrar.set(true);
    }

    aceptar() {
        this.mostrar.set(false);
        this._onConfirm?.();
        this._onConfirm = null;
    }

    cancelar() {
        this.mostrar.set(false);
        this._onConfirm = null;
    }
}
