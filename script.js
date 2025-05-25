let blockCount = 0;

		function createDialogueBlock(parent = null) {
			const container = parent || document.getElementById("dialogue-container");
			const block = document.createElement("div");
			block.className = "dialogue-block";
			block.dataset.id = blockCount++;

			block.innerHTML = `
				<label>ID:</label>
				<input type="text" class="dialogue-id">
				<label>Speaker Name:</label>
				<input type="text" class="dialogue-speaker">
				<label>Lines (one per line):</label>
				<textarea class="dialogue-lines" rows="4"></textarea>
				<label>Choices (optional, one per line. MAX 3):</label>
				<textarea class="dialogue-choices" rows="3"></textarea>
				<div class="after-choices-container"></div>
				<button onclick="addAfterChoice(this)">Add Follow-up to Choices</button>
			`;

			container.appendChild(block);
		}

		function addAfterChoice(button) {
			const block = button.parentElement;
			const choices = block.querySelector(".dialogue-choices").value.trim().split("\n");
			if (choices.length === 0 || (choices.length === 1 && choices[0] === "")) {
				alert("Please enter choices before adding follow-up blocks.");
				return;
			}

			const container = block.querySelector(".after-choices-container");
			container.innerHTML = ""; // reset follow-ups
			choices.forEach((choiceText, idx) => {
				const subContainer = document.createElement("div");
				subContainer.innerHTML = `<strong>Follow-up for choice ${idx + 1}:</strong>`;
				createDialogueBlock(subContainer);
				container.appendChild(subContainer);
			});
		}

		function generateLua() {
			const root = document.getElementById("dialogue-container").children[0];
			if (!root) {
				alert("Please enter at least one dialogue block.");
				return;
			}
			const lua = parseDialogueBlock(root);
			document.getElementById("output").textContent = "local dialogue = " + lua;
		}

		function parseDialogueBlock(block) {
			const id = block.querySelector(".dialogue-id").value;
			const speaker = block.querySelector(".dialogue-speaker").value;
			const lines = block.querySelector(".dialogue-lines").value.trim().split("\n").filter(Boolean);
			const choices = block.querySelector(".dialogue-choices").value.trim().split("\n").filter(Boolean);

			let lua = "{\n";
			if (id) lua += `\tid = "${id}",\n`;
			if (speaker) lua += `\tspeaker = "${speaker}",\n`;

			lua += `\tlines = {\n`;
			lines.forEach(line => {
				lua += `\t\t"${line}",\n`;
			});
			lua += `\t},\n`;

			if (choices.length > 0) {
				lua += `\tchoices = {\n`;
				choices.forEach(c => {
					lua += `\t\t"${c}",\n`;
				});
				lua += `\t},\n`;

				const afterContainer = block.querySelector(".after-choices-container");
				const children = afterContainer.querySelectorAll(":scope > div > .dialogue-block");

				lua += `\tafterChoice = {\n`;
				children.forEach((child, idx) => {
					lua += `\t\t[${idx + 1}] = ` + parseDialogueBlock(child) + ",\n";
				});
				lua += `\t}\n`;
			}

			lua += "}";
			return lua;
		}

		function copyOutput() {
			const output = document.getElementById("output").textContent;
			navigator.clipboard.writeText(output).then(() => alert("Copied!"));
		}

		// Initialize with one root block
		createDialogueBlock();