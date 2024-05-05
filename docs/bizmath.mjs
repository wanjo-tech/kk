// fix the math to support tensor

//TODO move to docs/ for frontend sharing too
//TODO dense + sparse(csr,csc,coo)
//TODO [ndim, size, dtype,], [dbytes,]
//TODO shareMemory for multi-process
//TODO fast calculation like NumPy and then for the tv-alike app.

var MathX = Object.create(Math);

MathX.Tensor = function({ndim=0, data=0} = {}) {
  if (!(this instanceof MathX.Tensor)) { return new MathX.Tensor({ndim, data}); }
  this.ndim = ndim;
  this.data = (ndim === 0) ? data : (Array.isArray(data) ? data : []);
};

MathX.Tensor.prototype.abs = function() {
  if (this.ndim === 0) {
    return new MathX.Tensor({ ndim: 0, data: Math.abs(this.data) });
  } else {
    return new MathX.Tensor({ ndim: this.ndim, data: this.data.map(Math.abs) });
  }
};

MathX.tmp = async function() {
  console.error('test async MathX.tmp');
  let rt = await Math.random();
  //let rt = Math.random();//
  console.error('test async MathX.tmp rt',rt);
  return rt;
};
MathX.tmp2 = function() {
  console.error('test async MathX.tmp2');
  //let rt = await Math.random();
  //let rt = Math.random();//
  let rt = (async()=>Math.random())();
  console.error('test async MathX.tmp2 rt',rt);
  return rt;
};
MathX.tmp3 = async function() {
  //console.error('test async MathX.tmp3');
  //let rt = await Math.random();
  //let rt = Math.random();//
  let rt = await (async()=>Math.random())();
  console.error('test async MathX.tmp3 rt',rt);
  return rt;
};


MathX.abs = function(value) {
  if (value instanceof MathX.Tensor) {
    return value.abs();
  } else {
    return Math.abs(value);
  }
};

export default MathX;

/**
TODO

scalar(ndim==0)

维度 (ndim / shape)：这决定了数据结构的形状，是多维数组操作的基础。
大小 (size)：表示数据结构中元素的总数量，有助于理解数据的规模。
数据类型 (dtype)：影响数据的表示和计算精度。

形状变换 (reshape)：在不改变数据本身的前提下，改变数据结构的形状，这对于数据重组和准备非常关键。
转置 (transpose)：矩阵的转置是线性代数中的基本操作，对于某些数学计算和算法来说非常重要。
加总 (sum)：沿着指定的轴计算元素的总和，是数学和统计分析中的基础操作。
平均值 (mean)：计算数值的平均，是最基本的统计度量之一。
标准偏差 (std)：度量数据的分散程度，是理解数据变异性的关键统计指标。


线性代数操作：对于深度学习和数据科学尤其重要的一类操作，比如矩阵乘法、特征值分解、奇异值分解等。这些操作在NumPy中可以通过 np.linalg 模块访问，在TensorFlow和PyTorch中也有相应的函数。
广播 (Broadcasting)：这是一种强大的机制，允许numpy和深度学习框架在进行算术运算时自动扩展数组的形状，使得具有不同形状的数组可以进行数学运算。

张量（tensor）的形状（shape）可以通过多种方式改变，并不仅限于手动使用 reshape 方法。实际上，根据所使用的库（如NumPy、TensorFlow、PyTorch等），存在多个方法和操作可以直接或间接地改变张量的形状。以下是一些改变张量形状的常见方法：

1. reshape
直接改变张量的形状，但不改变其数据。
使用时需要确保新形状与原始张量包含的元素数量相匹配。
2. squeeze 和 unsqueeze
squeeze：移除张量形状中所有大小为1的维度。
unsqueeze：在指定位置添加一个大小为1的维度。
这对于调整数据维度以满足特定操作的需求（如深度学习模型输入）非常有用。
3. flatten 或 ravel
将张量展平为一维数组。
通常用于数据预处理或在需要将多维数据转换为一维数组时。
4. 索引和切片
通过索引和切片操作，可以改变张量的形状，提取张量的子集。
例如，从一个多维张量中提取特定的行或列，将会得到一个新形状的张量。
5. expand_dims 或 unsqueeze
用于增加张量的维度，这在需要为张量增加一个新轴时非常有用。
6. concatenate、stack 和 tile
这些操作用于合并多个张量，可以改变结果张量的形状。
concatenate 沿指定轴连接张量。
stack 堆叠张量，创建一个新的维度。
tile 将张量复制多次，增加其大小。
7. 广播 (Broadcasting)
广播是一种强大的机制，允许在进行算术运算时自动扩展张量的形状，使得具有不同形状的张量可以进行数学运算。
广播规则可以隐式地改变张量的形状，以满足运算要求。

*/
