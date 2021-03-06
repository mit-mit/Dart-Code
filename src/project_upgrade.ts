import * as vs from "vscode";

export function upgradeProject() {
	remove_legacy_debug_settings();
}

function remove_legacy_debug_settings() {
	// Read launch.json config.
	const launchFile = vs.workspace.getConfiguration("launch");

	const configs = launchFile.get<any[]>("configurations");
	if (!configs)
		return;

	let hasChanged = false;

	// Find Dart CLI items that might need upgrading.
	configs.filter((c) => c.type === "dart-cli").map((d) => {
		// Remove the old sdkPath.
		if (d.sdkPath !== undefined) {
			console.log("Found old sdkPath, removing...");
			d.sdkPath = undefined;
			hasChanged = true;
		}

		// Remove the old debugSettings.
		if (d.debugSettings) {
			console.log("Found old debugSettings, removing...");
			d.debugSettings = undefined;
			hasChanged = true;

			// Remove checkedMode if it's default
			// Do this inside here so it only runs for things being upgraded from debugSettings
			// so we don't remove it if the user explicitly adds it (it may be convenient for toggling)
			if (d.checkedMode === true) {
				console.log("Found default checkedMode, removing...");
				d.checkedMode = undefined;
			}
		}

		// Remove cwd if it's default.
		if (d.cwd === "${workspaceRoot}") {
			console.log("Found default workspaceRoot, removing...");
			d.cwd = undefined;
			hasChanged = true;
		}

		// Remove args if they're default.
		if (d.args && d.args.length === 0) {
			console.log("Found default args, removing...");
			d.args = undefined;
			hasChanged = true;
		}
	});

	if (hasChanged)
		launchFile.update("configurations", configs);
}
