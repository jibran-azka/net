<?php

namespace Tests\Feature;

use App\Enums\TeamRole;
use App\Models\Device;
use App\Models\MonitoringResult;
use App\Models\Team;
use App\Models\TeamInvitation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $user = User::factory()->create();
        $team = $user->currentTeam;

        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $user = User::factory()->create();
        $team = $user->currentTeam;

        $response = $this
            ->actingAs($user)
            ->get(route('dashboard'));

        $response->assertOk();
    }

    public function test_dashboard_includes_pending_invitations_for_the_authenticated_user()
    {
        $owner = User::factory()->create(['name' => 'Taylor Otwell']);
        $invitedUser = User::factory()->create(['email' => 'invited@example.com']);
        $team = Team::factory()->create(['name' => 'Laravel Team']);

        $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

        $invitation = TeamInvitation::factory()->create([
            'team_id' => $team->id,
            'email' => 'invited@example.com',
            'invited_by' => $owner->id,
        ]);

        $response = $this
            ->actingAs($invitedUser)
            ->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('pendingInvitations', 1)
            ->where('pendingInvitations.0.code', $invitation->code)
            ->where('pendingInvitations.0.inviterName', 'Taylor Otwell')
            ->where('pendingInvitations.0.team.name', 'Laravel Team')
            ->where('pendingInvitations.0.team.slug', $team->slug)
            ->missing('pendingInvitations.0.teamName'),
        );
    }

    public function test_dashboard_does_not_include_accepted_invitations()
    {
        $owner = User::factory()->create();
        $invitedUser = User::factory()->create(['email' => 'invited@example.com']);
        $team = Team::factory()->create();

        $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

        TeamInvitation::factory()->accepted()->create([
            'team_id' => $team->id,
            'email' => 'invited@example.com',
            'invited_by' => $owner->id,
        ]);

        $response = $this
            ->actingAs($invitedUser)
            ->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('pendingInvitations', 0),
        );
    }

    public function test_dashboard_excludes_expired_invitations_without_deleting_them()
    {
        $owner = User::factory()->create();
        $invitedUser = User::factory()->create(['email' => 'invited@example.com']);
        $team = Team::factory()->create();

        $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

        $invitation = TeamInvitation::factory()->expired()->create([
            'team_id' => $team->id,
            'email' => 'invited@example.com',
            'invited_by' => $owner->id,
        ]);

        $response = $this
            ->actingAs($invitedUser)
            ->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('pendingInvitations', 0),
        );

        $this->assertDatabaseHas('team_invitations', [
            'id' => $invitation->id,
        ]);
    }

    public function test_dashboard_does_not_include_or_delete_other_users_invitations()
    {
        $owner = User::factory()->create();
        $invitedUser = User::factory()->create(['email' => 'invited@example.com']);
        $team = Team::factory()->create();

        $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

        $invitation = TeamInvitation::factory()->expired()->create([
            'team_id' => $team->id,
            'email' => 'someone@example.com',
            'invited_by' => $owner->id,
        ]);

        $response = $this
            ->actingAs($invitedUser)
            ->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('pendingInvitations', 0),
        );

        $this->assertDatabaseHas('team_invitations', [
            'id' => $invitation->id,
        ]);
    }

    public function test_dashboard_uses_the_latest_owned_result_and_keeps_unmonitored_devices_unknown(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $online = Device::factory()->create(['user_id' => $user->id, 'device_type' => 'router']);
        $offline = Device::factory()->create(['user_id' => $user->id, 'device_type' => 'switch']);
        Device::factory()->create(['user_id' => $user->id, 'device_type' => 'server']);
        $otherDevice = Device::factory()->create(['user_id' => $otherUser->id]);

        MonitoringResult::create(['device_id' => $online->id, 'status' => 'offline', 'latency' => null, 'packet_loss' => 100, 'packets_sent' => 4, 'packets_received' => 0, 'checked_at' => now()->subMinutes(2)]);
        MonitoringResult::create(['device_id' => $online->id, 'status' => 'online', 'latency' => 12.5, 'packet_loss' => 0, 'packets_sent' => 4, 'packets_received' => 4, 'checked_at' => now()->subMinute()]);
        MonitoringResult::create(['device_id' => $offline->id, 'status' => 'offline', 'latency' => null, 'packet_loss' => 100, 'packets_sent' => 4, 'packets_received' => 0, 'checked_at' => now()->subMinute()]);
        MonitoringResult::create(['device_id' => $otherDevice->id, 'status' => 'online', 'latency' => 2, 'packet_loss' => 0, 'packets_sent' => 4, 'packets_received' => 4, 'checked_at' => now()->subMinute()]);

        $response = $this->actingAs($user)->get(route('dashboard', ['current_team' => $user->currentTeam->slug]).'?period=24h');
        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('overview.total', 3)
                ->where('overview.online', 1)
                ->where('overview.offline', 1)
                ->where('overview.notMonitored', 1)
                ->where('availability.totalChecks', 3)
                ->where('availability.onlineChecks', 1)
                ->has('recentActivity', 3));
    }
}
