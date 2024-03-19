import { App, PluginSettingTab, Setting } from "obsidian";
import quizPlugin from "./main";

export default class QuizSettings extends PluginSettingTab {
	plugin: quizPlugin;

	constructor(app: App, plugin: quizPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		

		new Setting(containerEl)
			.setName('First format')
			.setDesc('Enables the first format')
			.addDropdown(dropdown => dropdown
				.addOption("Enabled","Enabled")
				.addOption("Disabled","Disabled")
				.setValue(this.plugin.settings.format1 ? "Enabled" : "Disabled")
				.onChange(async (value) =>{
					if(value == "Enabled"){
						this.plugin.settings.format1 = true;
					}else{
						this.plugin.settings.format1 = false;
					}
                    await this.plugin.saveSettings();
				})
				);

		new Setting(containerEl)
			.setName('Second format')
			.setDesc('Enables the second format')
			.addDropdown(dropdown => dropdown
				.addOption("Enabled","Enabled")
				.addOption("Disabled","Disabled")
				.setValue(this.plugin.settings.format2 ? "Enabled" : "Disabled")
				.onChange(async (value) =>{
					if(value == "Enabled"){
						this.plugin.settings.format2 = true;
					}else{
						this.plugin.settings.format2 = false;
					}
                    await this.plugin.saveSettings();
				})
				);
	}
}