import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';

@Component({
  selector: 'app-politica-privacidad',
  imports: [RouterModule, Navbar],
  templateUrl: './politica-privacidad.html',
  styleUrl: '../politica-garantia/politica-garantia.css',
})
export class PoliticaPrivacidad {}
