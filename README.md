```lua
local HttpService = game:GetService("HttpService")

local BaseUrl = ""
local Authorization = ""
local function SavePlayerData(userId: number, data: {})
	data.userId = tostring(userId)

	local ok, response = pcall(
		HttpService.PostAsync,
		HttpService,
		BaseUrl.."/add?gameName=ZEUS",
		HttpService:JSONEncode(data),
		Enum.HttpContentType.ApplicationJson,
		false,
		{
			["Authorization"] = Authorization
		}
	)

	if not ok then
		print("Failed to save data", userId)
	end
end
```
