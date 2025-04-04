export interface Env {
	PLAYER_DATA: DurableObjectNamespace;
}

export class ZeusForge implements DurableObject {
	state: DurableObjectState;
	storage: DurableObjectStorage;
	private KEY: string = "ZeusForge7e918522deaf4d4886122e30d09cb7b1";

	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
		this.storage = state.storage;
	}

	async fetch(request: Request): Promise<Response> {
		const { pathname, searchParams } = new URL(request.url);
		const method = request.method;

		const requestKey = request.headers.get("Authorization");
		if (!requestKey || requestKey !== this.KEY) {
			return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
		};

		if (request.method == "POST" && pathname == "/add") {
			const body = await request.json() as { userId: string; value: number };
			if (!body.userId || body.value == undefined) {
				return new Response("Invalid request", { status: 400 });
			};
			
			const playerData = (await this.storage.get<Record<string, number>>("playerData")) || {};
			playerData[body.userId] = body.value;

			return new Response(JSON.stringify({ success: true }), {
				headers: { "Content-Type": "application/json" },
			});
		}

		if (method == "GET" && pathname == "/get") {
			const userId = searchParams.get("userId");
			const playerData = (await this.storage.get<Record<string, number>>("playerData")) || {};

			if (userId) {
				return new Response(JSON.stringify({ userId, value: playerData[userId] || null }), {
					headers: { "Content-Type": "application/json" },
				});
			}

			return new Response(JSON.stringify(playerData), {
				headers: { "Content-Type": "application/json" },
			});
		}

		// Return a default response for unhandled cases
		return new Response("Not Found", { status: 404 });
	}
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const id = env.PLAYER_DATA.idFromName("global");
		const state = env.PLAYER_DATA.get(id);
		return state.fetch(request);
	}
} satisfies ExportedHandler<Env>;
