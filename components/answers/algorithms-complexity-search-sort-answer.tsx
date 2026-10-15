'use client';
import { createTopicPages, type TopicPageSpec } from './topic-page';

const specs: TopicPageSpec[] = [
  {id:'growth-language',chapter:'Complexity fundamentals',title:'Big O, Big Theta, and Big Omega',answer:'As input size n grows, asymptotic notation describes how resource use grows while ignoring constant factors and lower-order terms. Big O is an upper bound, Big Omega is a lower bound, and Big Theta is a tight bound containing both.',comparisons:[
    {title:'O(g(n))',text:'Eventually grows no faster than a constant multiple of g(n). Saying an exact n² algorithm is O(n³) is valid but loose.'},
    {title:'Ω(g(n))',text:'Eventually grows at least as fast as a constant multiple of g(n).'},
    {title:'Θ(g(n))',text:'Both upper and lower bounded by g(n), so it communicates the asymptotically tight growth rate.'}
  ],callout:{title:'Interview convention',text:'Interviewers often say “Big O” when asking for a tight worst-case bound. State the case and whether your bound is tight.'}},
  {id:'time-space-cases',chapter:'Complexity fundamentals',title:'Time, space, and best/average/worst cases',answer:'Time complexity counts growing work; auxiliary-space complexity counts extra memory beyond the input and sometimes excludes the returned result. Best, average, and worst case describe different inputs of the same size.',sections:[
    {title:'Example: linear search',bullets:['Best: Θ(1) when the first element matches.','Worst: Θ(n) when the value is last or absent.','Average: Θ(n) under a stated distribution of target positions.','Auxiliary space: Θ(1) for an iterative scan.']},
    {title:'Time-memory trade-off',text:'A HashSet can reduce repeated membership tests from linear scans to average constant time, paying O(n) extra memory. Choose from constraints rather than optimizing one resource in isolation.'}
  ]},
  {id:'loop-analysis',chapter:'Complexity fundamentals',title:'Consecutive, nested, and logarithmic loops',answer:'Add the work of consecutive blocks and keep the dominant term. Multiply iteration counts for nested loops only when the inner count applies for each outer iteration. Repeatedly multiplying or dividing the problem size produces logarithmic work.',codeLabel:'Read the loop shape',code:'// O(n) + O(n) = O(n)\nfor (int x : a) visit(x);\nfor (int x : a) validate(x);\n\n// O(n²)\nfor (int i = 0; i < n; i++)\n  for (int j = 0; j < n; j++) compare(i, j);\n\n// O(log n): n, n/2, n/4 ...\nfor (int size = n; size > 1; size /= 2) step();',sections:[
    {title:'Triangular loops',text:'If the inner loop runs i times, total work is 0 + 1 + … + (n−1) = n(n−1)/2 = Θ(n²), even though it is not exactly n² iterations.'}
  ]},
  {id:'recurrence-analysis',chapter:'Complexity fundamentals',title:'Recursive time and stack space',answer:'Write a recurrence describing subproblem count, subproblem size, and non-recursive work. Separately count maximum recursion depth for stack space.',comparisons:[
    {title:'T(n)=T(n−1)+O(1)',text:'One chain of n calls: O(n) time and O(n) call-stack space.'},
    {title:'T(n)=2T(n/2)+O(n)',text:'Two half-size subproblems plus linear merge work: O(n log n).'},
    {title:'T(n)=2T(n−1)+O(1)',text:'A branching tree close to 2ⁿ calls: exponential time and O(n) depth.'}
  ],callout:{title:'Do not confuse total calls with depth',text:'A recursion tree may contain exponentially many calls while only n calls are active on one path.'}},
  {id:'amortized',chapter:'Complexity fundamentals',title:'Amortized complexity and ArrayList.add()',answer:'Amortized analysis spreads rare expensive operations across a sequence. ArrayList append is usually one array write. Occasionally the backing array grows and existing references are copied, but geometric growth means n appends cause only O(n) total copying.',flow:['Write until capacity','Allocate a larger array','Copy existing references','Many cheap appends follow'],sections:[
    {title:'Why amortized O(1)',text:'Across n appends, ordinary writes cost O(n) and all growth copies form a geometric series bounded by O(n). Total O(n) divided across n operations is O(1) amortized.'},
    {title:'Not worst-case O(1)',text:'The particular append that resizes is O(n). Amortized describes a sequence, not every individual call.'}
  ]},
  {id:'growth-rates',chapter:'Complexity fundamentals',title:'Recognize common growth rates',answer:'Growth rate determines feasible input size. Constants still matter in real systems, but exponential and factorial growth become impossible much sooner than polynomial growth.',comparisons:[
    {title:'O(1) and O(log n)',text:'Array indexing; balanced-tree or binary search. Doubling n adds little logarithmic work.'},
    {title:'O(n) and O(n log n)',text:'Scanning; efficient comparison sorting. Commonly practical for large data.'},
    {title:'O(n²)',text:'All pairs or simple nested loops. Often acceptable only for moderate n.'},
    {title:'O(2ⁿ) and O(n!)',text:'Subset and permutation search. Usually requires small n, pruning, or a different formulation.'}
  ],sections:[{title:'Input-size judgment',text:'For n around millions, seek O(n) or O(n log n). For n around 20–30, carefully pruned 2ⁿ may be intentional. Always combine asymptotic cost with memory, constants, limits, and expected input distribution.'}]},
  {id:'linear-search',chapter:'Searching',title:'Linear search and when it wins',answer:'Linear search checks elements in encounter order until it finds the target or reaches the end. In the worst case it examines all n elements, so time is O(n) and extra space is O(1).',codeLabel:'Linear search',code:'static int indexOf(int[] a, int target) {\n  for (int i = 0; i < a.length; i++) {\n    if (a[i] == target) return i;\n  }\n  return -1;\n}',sections:[
    {title:'Prefer it when',bullets:['Data is unsorted and queried only once or a few times.','The collection is small.','Sorting or building an index costs more than the searches save.','Data is sequential, such as a LinkedList or stream.']},
    {title:'ArrayList by value',text:'ArrayList.get(index) is O(1), but contains(value) or indexOf(value) must compare candidates until a match, so value search is O(n).'}
  ]},
  {id:'binary-search',chapter:'Searching',title:'Binary search: why sorted order matters',answer:'Binary search compares the middle element and discards the half that cannot contain the target. After k comparisons the remaining size is n/2ᵏ, so reaching one element requires k≈log₂n.',codeLabel:'Overflow-safe iterative binary search',code:'static int binarySearch(int[] a, int target) {\n  int low = 0, high = a.length - 1;\n  while (low <= high) {\n    int mid = low + (high - low) / 2;\n    if (a[mid] < target) low = mid + 1;\n    else if (a[mid] > target) high = mid - 1;\n    else return mid;\n  }\n  return -1;\n}',sections:[
    {title:'Why sorting is required',text:'The comparison only identifies an impossible half when values are monotonic. In unsorted data, a smaller middle value says nothing about values on either side.'},
    {title:'Midpoint overflow',text:'Use low + (high−low)/2 instead of (low+high)/2 so two large nonnegative indices are not added first.'}
  ]},
  {id:'binary-boundaries',chapter:'Searching',title:'First, last, and insertion positions',answer:'Boundary binary search does not stop at the first equality. It records or preserves the candidate, then continues toward the boundary. The insertion position is the first index whose value is at least the target.',codeLabel:'Lower bound: first value >= target',code:'static int lowerBound(int[] a, int target) {\n  int low = 0, high = a.length;\n  while (low < high) {\n    int mid = low + (high - low) / 2;\n    if (a[mid] < target) low = mid + 1;\n    else high = mid;\n  }\n  return low;\n}',sections:[
    {title:'Derive the variants',bullets:['First occurrence: lowerBound, then verify index is in range and equals target.','Last occurrence: find first value greater than target, then subtract one.','Insertion position: lowerBound directly preserves sorted order.']}
  ]},
  {id:'search-variants',chapter:'Searching',title:'Rotated arrays, hash tables, and trees',answer:'The data structure determines what can be discarded. A rotated sorted array still has at least one sorted half. Hash tables use a computed bucket and equality checks. Trees use ordering to choose a branch.',sections:[
    {title:'Rotated sorted array',text:'At each step, determine which half is sorted, then test whether the target lies within that half. With distinct values this is O(log n); duplicates can make the decision ambiguous and degrade toward O(n).'},
    {title:'HashMap',text:'Average lookup is O(1) under good hash distribution and controlled load, but collisions require examining multiple entries. Pathological collisions or adversarial behavior can remove the constant-time assumption.'},
    {title:'Balanced versus unbalanced tree',text:'A balanced search tree has O(log n) height. A plain BST inserted in sorted order can become a chain of height n, making search O(n).'}
  ]},
  {id:'linked-binary-search',chapter:'Searching',title:'Why binary search is poor on LinkedList',answer:'Binary search needs fast access to the middle. Arrays and ArrayList provide O(1) indexed access. LinkedList must traverse nodes to reach each midpoint, erasing the benefit and producing linear overall behavior with poor constants.',sections:[
    {title:'Interview nuance',text:'The number of comparisons can remain logarithmic, yet navigation across links costs O(n) total. Complexity must include the cost of obtaining each compared element, not only comparison count.'}
  ],callout:{title:'Choose the structure from the operation',text:'If repeated binary search matters, keep data in an array-backed or indexed structure. If data is already a LinkedList, a sequential scan is simpler and no worse asymptotically.'}},
  {id:'simple-sorts',chapter:'Sorting',title:'Bubble, selection, and insertion sort',answer:'These O(n²) families differ in what they preserve. Bubble sort repeatedly swaps adjacent inversions. Selection sort chooses the smallest remaining value. Insertion sort grows a sorted prefix by shifting larger values right.',comparisons:[
    {title:'Bubble sort',text:'Stable with adjacent swaps; O(n²) average/worst and O(n) best with an early-exit flag. Mostly educational.'},
    {title:'Selection sort',text:'O(n²) comparisons in every case, O(n) swaps, in-place, usually unstable.'},
    {title:'Insertion sort',text:'Stable, in-place, O(n²) worst but O(n) on already sorted input; strong for small or nearly sorted ranges.'}
  ]},
  {id:'merge-sort',chapter:'Sorting',title:'Merge sort: predictable O(n log n)',answer:'Merge sort recursively divides the range in half, sorts both halves, then merges them in linear time. There are log n levels and each level processes n elements, yielding O(n log n) in every input arrangement.',flow:['Split in halves','Sort left','Sort right','Merge ordered halves'],sections:[
    {title:'Trade-offs',bullets:['Stable when equal values are taken from the left half first.','Array implementations normally need O(n) auxiliary storage.','Excellent for linked lists and external sorting because merging is sequential.']}
  ]},
  {id:'quicksort',chapter:'Sorting',title:'Quicksort and the O(n²) trap',answer:'Quicksort partitions values around a pivot, then sorts the partitions. Balanced partitions create log n levels of O(n) partitioning, giving O(n log n) average time. Repeatedly choosing an extreme pivot creates a chain and O(n²) time.',sections:[
    {title:'Reduce bad partitions',bullets:['Randomize the pivot or input.','Use median-style pivot selection.','Handle many equal keys with three-way partitioning.','Limit recursion depth or fall back to another algorithm.']},
    {title:'Properties',text:'Typical array quicksort is in-place apart from recursion and usually unstable. Its locality and low constants often make it fast in practice.'}
  ]},
  {id:'heap-counting-sort',chapter:'Sorting',title:'Heap sort and counting sort',answer:'Heap sort repeatedly removes the extreme element from a binary heap: O(n log n) worst-case, O(1) auxiliary array space, and unstable. Counting sort counts occurrences across a bounded key range instead of comparing pairs.',comparisons:[
    {title:'Heap sort',text:'Predictable O(n log n), in-place, limited extra memory, weaker locality than quicksort.'},
    {title:'Counting sort',text:'O(n+k) time and O(k) extra space for key range k. It wins when k is reasonably small relative to n.'}
  ],callout:{title:'Beyond the comparison lower bound',text:'The Ω(n log n) lower bound applies to general comparison sorting. Counting and radix methods use additional assumptions about key representation.'}},
  {id:'sorting-properties',chapter:'Sorting',title:'Stability, in-place operation, and lower bounds',answer:'A stable sort preserves the original relative order of elements that compare equal. An in-place sort uses only constant or logarithmic auxiliary memory, depending on the definition. These properties matter independently from runtime.',sections:[
    {title:'Why stability matters',text:'Sort employees by name, then stably by department: names remain ordered within each department. An unstable second sort can destroy that earlier order.'},
    {title:'Why comparison sorting needs Ω(n log n)',text:'There are n! possible orders. A comparison gives at most two outcomes, so the decision tree needs height at least log₂(n!), which is Θ(n log n).'}
  ]},
  {id:'java-sorting',chapter:'Sorting in Java',title:'Arrays.sort(), List.sort(), Comparable, and Comparator',answer:'Java separates the ordering contract from implementation choice. Comparable defines a type’s natural order; Comparator supplies an external order. API guarantees such as stability matter more than relying on a replaceable implementation detail.',codeLabel:'Express the required order',code:'record Candidate(String name, int score) {}\n\nComparator<Candidate> ranking =\n    Comparator.comparingInt(Candidate::score).reversed()\n              .thenComparing(Candidate::name);\n\ncandidates.sort(ranking);',sections:[
    {title:'Java 25 concepts',bullets:['Arrays.sort on primitive arrays documents Dual-Pivot Quicksort as an implementation note.','Object-array sorting and List.sort are stable; current List.sort documentation describes an adaptive mergesort derived from TimSort.','List.sort first obtains an array in its default implementation, avoiding repeated indexed traversal of a linked list.','Comparator must define a consistent ordering; compare(a,b)==0 means equal position in that order, which need not equal Object.equals unless the design requires it.']}
  ]},
  {id:'interview-method',chapter:'Interview method',title:'Solve algorithm questions like an engineer',answer:'Clarify the contract before choosing an algorithm. State a correct baseline, identify the bottleneck, improve it from a property of the data, and verify the optimized version with edge cases.',flow:['Clarify inputs and output','State brute force','Choose a useful structure','Test and analyze'],sections:[
    {title:'Questions to ask',bullets:['Can input be null or empty? Are values sorted, unique, bounded, or mutable?','What result is required for duplicates? Can the input be modified?','How large can n and the value range become?','Is time, memory, stability, or simplicity the main constraint?']},
    {title:'Manual tests',text:'Use empty, one element, duplicates, already ordered, reverse ordered, absent target, boundary indices, overflow-sized values, and the smallest case that exercises each branch.'},
    {title:'Explain the trade-off',text:'Give time and auxiliary space, including preprocessing. Distinguish average from worst case and mention why the chosen structure supports the dominant operation.'}
  ],links:[
    {label:'Java 25 Arrays API',href:'https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Arrays.html'},
    {label:'Java 25 List.sort contract',href:'https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html#sort(java.util.Comparator)'},
    {label:'Java 25 Comparator contract',href:'https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Comparator.html'}
  ]}
];

export const algorithmsComplexityPages=createTopicPages(specs);
