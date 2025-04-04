export interface Env {
	PLAYER_DATA: DurableObjectNamespace;
}

export class ZeusForge implements DurableObject {
	state: DurableObjectState;
	storage: DurableObjectStorage;
	private KEY: string = "";

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
		}

		const gameName = searchParams.get("gameName");
		if (!gameName) {
			return new Response(JSON.stringify({ error: "Missing game name"}), { status: 400 });
		}

		if (request.method == "POST" && pathname == "/add") {
			const bodyText = await request.text();
			let body;

			try	{
				body = JSON.parse(bodyText);
			} catch (e) {
				return new Response("Invalid JSON", { status: 400 });
			}

			const userId = body.userId;
			if (!userId || typeof userId !== "string") {
				return new Response("Invalid userId", { status: 400 });
			}

			delete body.userId;

			const playerData = (await this.storage.get<Record<string, any>>("playerData")) || {};
			if (!playerData[gameName]) {
				playerData[gameName] = {};
			}

			playerData[gameName][userId] = { ...(playerData[gameName][userId] || {}), ...body };

			await this.storage.put("playerData", playerData);

			return new Response(JSON.stringify({ success: true }), {
				headers: { "Content-Type": "application/json" },
			});
		}

		if (method == "GET" && pathname == "/get") {
			const userId = searchParams.get("userId");
			const playerData = (await this.storage.get<Record<string, any>>("playerData")) || {};

			if (!playerData[gameName]) {
				return new Response(JSON.stringify({ error: "Game not found" }), { status: 404 });
			}

			if (userId) {
				return new Response(JSON.stringify(playerData[gameName][userId] || {}), {
					headers: { "Content-Type": "application/json" },
				})
			}

			return new Response(JSON.stringify(playerData[gameName]), {
				headers: { "Content-Type": "application/json" },
			});
		}

		// Return a default response for unhandled
		return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
	}
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const id = env.PLAYER_DATA.idFromName("global");
		const state = env.PLAYER_DATA.get(id);
		return state.fetch(request);
	}
} satisfies ExportedHandler<Env>;
