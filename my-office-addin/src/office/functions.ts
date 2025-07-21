/**
 * 置換ロジック本体。
 * Office.actions.associate から呼び出される想定。
 */
export async function runReplaceLogic(findText: string, replaceText: string): Promise<void> {
  await Word.run(async context => {
    const body = context.document.body;
    const results = body.search(findText, { matchCase: false, matchWholeWord: false });
    results.load("items");
    await context.sync();

    for (const range of results.items) {
      range.insertText(replaceText, Word.InsertLocation.replace);
    }
    await context.sync();
  });
}
