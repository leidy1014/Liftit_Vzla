import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';

@Component({
  selector: 'app-politica-retracto',
  imports: [RouterModule, Navbar],
  templateUrl: './politica-retracto.html',
  styleUrl: '../politica-garantia/politica-garantia.css',
})
export class PoliticaRetracto {}
