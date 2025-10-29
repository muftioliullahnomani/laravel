<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserAdminController extends Controller
{
    public function index(Request $request)
    {
        $users = User::query()
            ->when($request->filled('q'), function($q) use ($request){
                $s = $request->string('q')->toString();
                $q->where(function($w) use ($s){
                    $w->where('name','like',"%$s%")
                      ->orWhere('email','like',"%$s%");
                });
            })
            ->orderBy('id','desc')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Users/Form', [
            'user' => null,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'email' => ['required','email','max:255','unique:users,email'],
            'password' => ['required','string','min:6'],
            'is_admin' => ['sometimes','boolean'],
        ]);
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'email_verified_at' => now(),
            'is_admin' => (bool)($data['is_admin'] ?? false),
        ]);
        return redirect()->route('admin.users.index')->with('success','User created');
    }

    public function edit(User $user)
    {
        return Inertia::render('Admin/Users/Form', [
            'user' => $user->only(['id','name','email','is_admin']),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'email' => ['required','email','max:255','unique:users,email,'.$user->id],
            'password' => ['nullable','string','min:6'],
            'is_admin' => ['sometimes','boolean'],
        ]);
        $payload = [
            'name' => $data['name'],
            'email' => $data['email'],
            'is_admin' => (bool)($data['is_admin'] ?? $user->is_admin),
        ];
        if (!empty($data['password'])) {
            $payload['password'] = Hash::make($data['password']);
        }
        $user->update($payload);
        return redirect()->route('admin.users.index')->with('success','User updated');
    }

    public function destroy(User $user)
    {
        // Prevent self-delete for safety
        if (auth()->id() === $user->id) {
            return back()->with('error','You cannot delete your own account.');
        }
        $user->delete();
        return back()->with('success','User deleted');
    }

    public function promote(User $user)
    {
        $user->update(['is_admin' => true]);
        return back()->with('success','User promoted to admin');
    }

    public function demote(User $user)
    {
        if (auth()->id() === $user->id) {
            return back()->with('error','You cannot demote yourself.');
        }
        $user->update(['is_admin' => false]);
        return back()->with('success','User demoted from admin');
    }
}
