```lua
KEY_DATA = "Tnp1"

local HttpService = game:GetService("HttpService")
local BaseUrl = ""
local Authorization = ""
local function SavePlayerData(userId: number, data: {})
	data.userId = tostring(userId)

	local ok, response = pcall(
		HttpService.PostAsync,
		HttpService,
		BaseUrl.."/add?gameName="..KEY_DATA,
		HttpService:JSONEncode(data),
		Enum.HttpContentType.ApplicationJson,
		false,
		{
			["Authorization"] = Authorization
		}
	)

	if not ok then
		print("Failed to save data", userId, ok, response)
	end
end

local function GetPlayerData(userId)
	userId = tostring(userId)

	local ok, response = pcall(
		HttpService.GetAsync,
		HttpService,
		BaseUrl.."/get?gameName="..KEY_DATA.."&userId="..userId,
		false,
		{
			["Authorization"] = Authorization
		}
	)

	if ok then
		return HttpService:JSONDecode(response)
	end
end

local userId = 123
SavePlayerData(userId, {
	Money = 1000
})

print(GetPlayerData(userId)
```
