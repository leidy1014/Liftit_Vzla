import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';

@Component({
  selector: 'app-politica-garantia',
  imports: [RouterModule, Navbar],
  templateUrl: './politica-garantia.html',
  styleUrl: './politica-garantia.css',
})
export class PoliticaGarantia {}
