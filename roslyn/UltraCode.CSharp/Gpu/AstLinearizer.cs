using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace UltraCode.CSharp.Gpu;

/// <summary>
/// Converts Roslyn AST nodes into GPU-friendly linear int[] buffers.
/// Each method/entity is represented as a contiguous range of SyntaxKind IDs.
/// </summary>
public static class AstLinearizer
{
    /// <summary>
    /// Linearizes multiple method bodies into a flat buffer with boundary indices.
    /// Returns (nodeKinds, methodStarts, methodEnds) for GPU processing.
    /// </summary>
    public static (int[] nodeKinds, int[] starts, int[] ends) LinearizeMethods(List<SyntaxNode> methods)
    {
        if (methods.Count == 0)
            return ([], [], []);

        // Pre-calculate total node count for single allocation
        int totalNodes = 0;
        var counts = new int[methods.Count];
        for (int i = 0; i < methods.Count; i++)
        {
            counts[i] = methods[i].DescendantNodes().Count();
            totalNodes += counts[i];
        }

        var nodeKinds = new int[totalNodes];
        var starts = new int[methods.Count];
        var ends = new int[methods.Count];
        int offset = 0;

        for (int i = 0; i < methods.Count; i++)
        {
            starts[i] = offset;
            foreach (var node in methods[i].DescendantNodes())
            {
                nodeKinds[offset++] = (int)node.Kind();
            }
            ends[i] = offset;
        }

        return (nodeKinds, starts, ends);
    }

    /// <summary>
    /// Extracts token sequences from method bodies for similarity hashing.
    /// Each method's tokens are packed into a contiguous region.
    /// </summary>
    public static (int[] tokenKinds, int[] starts, int[] ends) LinearizeTokens(List<SyntaxNode> methods)
    {
        if (methods.Count == 0)
            return ([], [], []);

        int totalTokens = 0;
        for (int i = 0; i < methods.Count; i++)
            totalTokens += methods[i].DescendantTokens().Count();

        var tokenKinds = new int[totalTokens];
        var starts = new int[methods.Count];
        var ends = new int[methods.Count];
        int offset = 0;

        for (int i = 0; i < methods.Count; i++)
        {
            starts[i] = offset;
            foreach (var token in methods[i].DescendantTokens())
            {
                tokenKinds[offset++] = (int)token.Kind();
            }
            ends[i] = offset;
        }

        return (tokenKinds, starts, ends);
    }

    // SyntaxKind IDs that contribute to cyclomatic complexity
    public static readonly HashSet<int> ComplexityKinds = new()
    {
        (int)SyntaxKind.IfStatement,
        (int)SyntaxKind.ConditionalExpression,
        (int)SyntaxKind.CaseSwitchLabel,
        (int)SyntaxKind.CasePatternSwitchLabel,
        (int)SyntaxKind.WhileStatement,
        (int)SyntaxKind.ForStatement,
        (int)SyntaxKind.ForEachStatement,
        (int)SyntaxKind.DoStatement,
        (int)SyntaxKind.CatchClause,
        (int)SyntaxKind.ConditionalAccessExpression,
        (int)SyntaxKind.LogicalAndExpression,
        (int)SyntaxKind.LogicalOrExpression,
        (int)SyntaxKind.CoalesceExpression,
    };

    /// <summary>
    /// Packs the complexity-contributing SyntaxKind IDs into a sorted int array for GPU kernel lookup.
    /// </summary>
    public static int[] GetComplexityKindsSorted()
    {
        var arr = ComplexityKinds.ToArray();
        Array.Sort(arr);
        return arr;
    }
}
