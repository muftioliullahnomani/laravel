<?php

namespace App\Http\Controllers;

use App\Models\HomeCardStyle;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeCardStyleController extends Controller
{
    protected function defaultStyle(): array
    {
        $base = [
            'card' => [
                'shadow' => 'shadow',
                'roundedTopLeft' => 8,
                'roundedTopRight' => 8,
                'roundedBottomLeft' => 8,
                'roundedBottomRight' => 8,
            ],
            'image' => [
                'ratio' => '1:1',
                'fit' => 'cover',
                'roundedTopLeft' => 8,
                'roundedTopRight' => 8,
                'roundedBottomLeft' => 8,
                'roundedBottomRight' => 8,
                'placeholderMode' => 'auto',
                'placeholderUrl' => '',
            ],
            'price' => [ 'show' => true ],
            'hover' => [ 'show' => true ],
            'buttons' => [
                'show' => true,
                'position' => 'over', // over | below
                'rounded' => 9999,
                'style' => 'solid', // solid | outline
            ],
            'viewDetails' => [ 'show' => true ],
            'addToCart' => [ 'show' => true ],
            'badge' => [ 'show' => false, 'position' => 'top-left', 'text' => '' ],
            'altText' => [ 'show' => false, 'position' => 'below' ],
        ];
        return [
            'home' => $base,
            'section' => $base,
        ];
    }

    public function edit()
    {
        $rec = HomeCardStyle::query()->first();
        if (!$rec) {
            $rec = HomeCardStyle::create(['style' => $this->defaultStyle()]);
        }
        // Normalize: if legacy flat style saved, wrap into {home, section}
        $style = $rec->style;
        if (isset($style['card']) && isset($style['image']) && !isset($style['home']) && !isset($style['section'])) {
            $style = [ 'home' => $style, 'section' => $style ];
            $rec->style = $style;
            $rec->save();
        }
        $scope = request()->routeIs('dashboard.section_style.edit') ? 'section' : 'home';
        return Inertia::render('Dashboard/HomeCardStyle', [
            'style' => $style,
            'scope' => $scope,
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'style' => ['required','array'],
        ]);
        $rec = HomeCardStyle::query()->first();
        if (!$rec) {
            $rec = new HomeCardStyle();
        }
        // Accept either nested {home, section} or legacy flat structure
        $incoming = $data['style'];
        if (isset($incoming['card']) && isset($incoming['image'])) {
            $incoming = [ 'home' => $incoming, 'section' => $incoming ];
        }
        $rec->style = $incoming;
        $rec->save();
        return redirect()->route('dashboard.home_style.edit')->with('success', 'Home style updated');
    }
}
