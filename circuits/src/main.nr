struct Type1 {
  val1: Field,
  val2: Field,
  val3: Field,
}

struct Nested {
  t1: Type1,
  is_true: bool,
}

fn main(x: pub Field, nested: pub Nested, y: pub Field) {
  constrain x as u120 > 10;
  constrain nested.t1.val1 + nested.t1.val2 == nested.t1.val3;
  constrain nested.is_true;
  constrain y as u120 < 100;
}

#[test]
fn test_main() {
  let nest = Nested {
    t1: Type1 {
      val1: 20,
      val2: 30,
      val3: 50,
    },
    is_true: true,
  };

  main(20, nest, 80);
}