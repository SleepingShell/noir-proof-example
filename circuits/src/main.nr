struct Type1 {
  val1: Field,
  val2: Field,
  val3: Field,
}

struct Nested {
  t1: Type1,
  is_true: bool,
}

struct DualNested {
  first: Nested,
  second: Nested,
}

fn main(x: pub Field, nested: pub DualNested, y: pub Field) {
  constrain x as u120 > 10;
  constrain nested.first.t1.val1 + nested.first.t1.val2 == nested.first.t1.val3;
  constrain nested.first.is_true;
  constrain y as u120 < 100;
}

#[test]
fn test_main() {
  let nest = DualNested {
    first: Nested {
      t1: Type1 {
        val1: 20,
        val2: 30,
        val3: 50,
      },
      is_true: true,
    },
    second: Nested {
      t1: Type1 {
        val1: 30,
        val2: 70,
        val3: 100
      },
      is_true: true,
    }
  };

  main(20, nest, 80);
}