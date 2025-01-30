// Function to obtain the CSS class corresponding to the font size
export const getFontSizeClass = (fontSize: string) => {
	const size = parseInt(fontSize, 10);
	if (size === 12) return "pdf-text-overlay-font-size-12";
	if (size === 14) return "pdf-text-overlay-font-size-14";
	if (size === 16) return "pdf-text-overlay-font-size-16";
	if (size === 18) return "pdf-text-overlay-font-size-18";
	if (size === 20) return "pdf-text-overlay-font-size-20";
	if (size === 24) return "pdf-text-overlay-font-size-24";
	return "pdf-text-overlay-font-size-14"; // Valeur par défaut
};

// Function to obtain the CSS class corresponding to the font family
export const getFontFamilyClass = (fontFamily: string) => {
	switch (fontFamily.toLowerCase()) {
		case "arial": return "pdf-text-overlay-font-family-arial";
		case "verdana": return "pdf-text-overlay-font-family-verdana";
		case "times new roman": return "pdf-text-overlay-font-family-times";
		case "courier new": return "pdf-text-overlay-font-family-courier";
		case "georgia": return "pdf-text-overlay-font-family-georgia";
		default: return "pdf-text-overlay-font-family-arial"; // Valeur par défaut
	}
};
